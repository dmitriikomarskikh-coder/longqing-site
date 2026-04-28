import fs from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {NextResponse} from "next/server";
import {isValidPhoneNumber} from "libphonenumber-js";
import {z} from "zod";
import {sendCrm} from "@/lib/notifications/crm";
import {sendDingTalk} from "@/lib/notifications/dingtalk";
import {
  isSmtpConfigurationError,
  sendEmail,
  type SubmissionFile,
  type SubmissionPayload
} from "@/lib/notifications/email";
import {sendTelegram} from "@/lib/notifications/telegram";
import {sendWeChat} from "@/lib/notifications/wechat";

export const runtime = "nodejs";

const allowedExtensions = new Set([
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "jpg",
  "jpeg",
  "png",
  "zip",
  "rar",
  "dwg",
  "dxf",
  "step",
  "iges"
]);

const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const fileSchema = z.object({
  originalName: z.string().trim().min(1).max(240),
  storedName: optionalText(240),
  size: z.number().int().min(0).max(25 * 1024 * 1024)
});

const submissionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  company: optionalText(120).refine((value) => !value || value.length >= 2),
  phone: optionalText(80).refine((value) => !value || isValidPhoneNumber(value)),
  email: z.string().trim().email(),
  message: optionalText(4000),
  locale: z.enum(["ru", "zh", "en"]).optional(),
  consent: z.union([z.literal(true), z.literal("true")]),
  brand: optionalText(120),
  pageUrl: optionalText(1000),
  sourceUrl: optionalText(1000),
  formSource: optionalText(120),
  utm: z.unknown().optional(),
  files: z.array(fileSchema).max(10).optional(),
  website: z.string().max(0).optional()
});

function storageRoot() {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), "public", "uploads");
}

function logRoot() {
  return process.env.LOG_DIR ?? path.join(process.cwd(), ".logs", "longqing");
}

function monthKey() {
  return new Date().toISOString().slice(0, 7);
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function appendJsonl(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
  await fs.appendFile(filePath, `${JSON.stringify(value)}\n`, "utf8");
}

async function parseJsonRequest(request: Request) {
  const raw = await request.json();
  return {
    raw,
    files: Array.isArray(raw?.files) ? raw.files : []
  };
}

async function parseMultipartRequest(request: Request) {
  const formData = await request.formData();
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([key]) => key !== "files")
  );
  const files = formData.getAll("files").filter((file): file is File => file instanceof File);

  if (files.length > 10) {
    throw new Error("INVALID_FILES");
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 100 * 1024 * 1024) {
    throw new Error("INVALID_FILES");
  }

  const uploadDir = path.join(storageRoot(), monthKey());
  await fs.mkdir(uploadDir, {recursive: true});

  const storedFiles: SubmissionFile[] = [];
  for (const file of files) {
    if (file.size > 25 * 1024 * 1024) {
      throw new Error("INVALID_FILES");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) {
      throw new Error("INVALID_FILES");
    }

    const storedName = `${randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadDir, storedName), bytes);
    storedFiles.push({
      originalName: file.name,
      storedName,
      size: file.size
    });
  }

  return {raw, files: storedFiles};
}

function safeNotificationResult(result: PromiseSettledResult<unknown>) {
  if (result.status === "fulfilled") {
    return result.value;
  }

  return {
    status: "rejected",
    message: result.reason instanceof Error ? result.reason.message : "Notification failed"
  };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const {raw, files} = contentType.includes("application/json")
      ? await parseJsonRequest(request)
      : await parseMultipartRequest(request);
    const parsed = submissionSchema.safeParse({...raw, files});

    if (!parsed.success) {
      return NextResponse.json({ok: false, error: "Invalid form data"}, {status: 400});
    }

    const createdAt = new Date().toISOString();
    const payload: SubmissionPayload = {
      name: parsed.data.name,
      company: parsed.data.company,
      phone: parsed.data.phone ?? "",
      email: parsed.data.email,
      message: parsed.data.message ?? "",
      locale: parsed.data.locale,
      brand: parsed.data.brand,
      pageUrl: parsed.data.pageUrl,
      sourceUrl: parsed.data.sourceUrl,
      formSource: parsed.data.formSource,
      createdAt,
      files: parsed.data.files ?? []
    };

    await appendJsonl(path.join(logRoot(), "submissions", `${dayKey()}.jsonl`), {
      ...payload,
      utm: parsed.data.utm
    });

    try {
      await sendEmail(payload);
    } catch (error) {
      await appendJsonl(path.join(logRoot(), "notifications.log"), {
        createdAt,
        channel: "email",
        status: "failed",
        reason: isSmtpConfigurationError(error) ? "SMTP configuration is incomplete" : "Email delivery failed"
      });

      return NextResponse.json(
        {
          ok: false,
          error: isSmtpConfigurationError(error)
            ? "Email notifications are not configured"
            : "Could not send request"
        },
        {status: 500}
      );
    }

    const results = await Promise.allSettled([
      sendTelegram(payload),
      sendWeChat(payload),
      sendDingTalk(payload),
      sendCrm(payload)
    ]);

    await appendJsonl(path.join(logRoot(), "notifications.log"), {
      createdAt,
      channel: "optional",
      results: results.map(safeNotificationResult)
    });

    return NextResponse.json({ok: true});
  } catch (error) {
    await appendJsonl(path.join(logRoot(), "notifications.log"), {
      createdAt: new Date().toISOString(),
      status: "failed",
      reason: error instanceof Error ? error.message : "Contact request failed"
    });

    return NextResponse.json({ok: false, error: "Could not send request"}, {status: 500});
  }
}
