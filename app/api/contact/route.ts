import fs from "node:fs/promises";
import path from "node:path";
import {randomUUID} from "node:crypto";
import {NextResponse} from "next/server";
import {isValidPhoneNumber} from "libphonenumber-js";
import {z} from "zod";
import {sendCrm} from "@/lib/notifications/crm";
import {sendDingTalk} from "@/lib/notifications/dingtalk";
import {sendEmail, type SubmissionPayload} from "@/lib/notifications/email";
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

const submissionSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().refine((value) => isValidPhoneNumber(value)),
  email: z.string().email(),
  message: z.string().min(10).max(4000),
  locale: z.enum(["ru", "zh", "en"]),
  consent: z.literal("true"),
  brand: z.string().optional(),
  sourceUrl: z.string().optional(),
  utm: z.string().optional(),
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

export async function POST(request: Request) {
  const formData = await request.formData();
  const raw = Object.fromEntries(
    Array.from(formData.entries()).filter(([key]) => key !== "files")
  );
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    return NextResponse.json({ok: false}, {status: 400});
  }

  const files = formData.getAll("files").filter((file): file is File => file instanceof File);

  if (files.length > 10) {
    return NextResponse.json({ok: false}, {status: 400});
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 100 * 1024 * 1024) {
    return NextResponse.json({ok: false}, {status: 400});
  }

  const uploadDir = path.join(storageRoot(), monthKey());
  await fs.mkdir(uploadDir, {recursive: true});

  const storedFiles = [];
  for (const file of files) {
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ok: false}, {status: 400});
    }

    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowedExtensions.has(extension)) {
      return NextResponse.json({ok: false}, {status: 400});
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

  const payload: SubmissionPayload = {
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email,
    message: parsed.data.message,
    locale: parsed.data.locale,
    brand: parsed.data.brand,
    sourceUrl: parsed.data.sourceUrl,
    files: storedFiles
  };

  await appendJsonl(path.join(logRoot(), "submissions", `${dayKey()}.jsonl`), {
    ...payload,
    createdAt: new Date().toISOString(),
    utm: parsed.data.utm
  });

  const results = await Promise.allSettled([
    sendEmail(payload),
    sendTelegram(payload),
    sendWeChat(payload),
    sendDingTalk(payload),
    sendCrm(payload)
  ]);

  await appendJsonl(path.join(logRoot(), "notifications.log"), {
    createdAt: new Date().toISOString(),
    results
  });

  return NextResponse.json({ok: true});
}
