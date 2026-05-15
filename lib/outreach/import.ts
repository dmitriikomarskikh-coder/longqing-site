import * as XLSX from "xlsx";
import {getOutreachDb, emailHash, addEvent} from "@/lib/outreach/db";
import {isValidOutreachEmail} from "@/lib/outreach/template";

type ParsedRow = {
  company: string;
  email: string;
};

export class OutreachImportError extends Error {
  constructor(public code: string) {
    super(code);
  }
}

function uploadError(code: string): never {
  throw new OutreachImportError(code);
}

function parseCsv(buffer: Buffer) {
  return buffer
    .toString("utf8")
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function rowsFromWorkbook(buffer: Buffer) {
  try {
    const workbook = XLSX.read(buffer, {type: "buffer"});
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) {
      uploadError("workbook_is_empty");
    }
    return XLSX.utils.sheet_to_json<string[]>(firstSheet, {header: 1, raw: false, blankrows: false});
  } catch (error) {
    if (error instanceof OutreachImportError) {
      throw error;
    }
    uploadError("invalid_workbook");
  }
}

function normalizeHeader(value: string | undefined) {
  return (value ?? "").trim().toLowerCase().replace(/ё/g, "е");
}

function hasCompanyEmailHeader(first: string[]) {
  const company = normalizeHeader(first[0]);
  const email = normalizeHeader(first[1]);
  const companyHeaders = new Set(["company", "компания", "название компании", "наименование компании", "организация"]);
  const emailHeaders = new Set(["email", "e-mail", "электронная почта", "почта", "email address"]);
  return companyHeaders.has(company) && emailHeaders.has(email);
}

function normalizeRows(rows: string[][]): ParsedRow[] {
  const [first, ...rest] = rows;
  if (!first) {
    return [];
  }
  const hasHeader = hasCompanyEmailHeader(first);
  return (hasHeader ? rest : rows).map((row) => ({
    company: (row[0] ?? "").trim(),
    email: (row[1] ?? "").trim().toLowerCase()
  }));
}

function isZipBasedWorkbook(buffer: Buffer) {
  return buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
}

function detectUploadKind(file: File, buffer: Buffer) {
  const lowerName = file.name.trim().toLowerCase();
  const mime = file.type.toLowerCase();
  if (lowerName.endsWith(".csv") || mime.includes("csv")) {
    return "csv";
  }
  if (
    lowerName.endsWith(".xlsx") ||
    mime.includes("spreadsheetml") ||
    mime.includes("excel") ||
    isZipBasedWorkbook(buffer)
  ) {
    return "xlsx";
  }
  return null;
}

export async function importRecipientsFile(file: File) {
  if (file.size > 2 * 1024 * 1024) {
    uploadError("file_too_large");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = detectUploadKind(file, buffer);
  if (!kind) {
    uploadError("unsupported_file_type");
  }
  const rows = normalizeRows(kind === "xlsx" ? rowsFromWorkbook(buffer) : parseCsv(buffer));
  const database = getOutreachDb();
  const now = new Date().toISOString();
  const upload = database
    .prepare(
      "insert into outreach_uploads (filename_original, rows_total, rows_imported, rows_skipped, created_at) values (?, ?, 0, 0, ?)"
    )
    .run(file.name, rows.length, now);
  const uploadId = Number(upload.lastInsertRowid);
  let imported = 0;
  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  const existing = new Set(
    (database.prepare("select email_hash from outreach_recipients").all() as Array<{email_hash: string}>).map(
      (row) => row.email_hash
    )
  );
  const insert = database.prepare(
    "insert into outreach_recipients (company, email, email_hash, status, created_at, updated_at, source_upload_id) values (?, ?, ?, 'queued', ?, ?, ?)"
  );

  for (const row of rows) {
    if (!row.company || !isValidOutreachEmail(row.email)) {
      skippedInvalid += 1;
      continue;
    }
    const hash = emailHash(row.email);
    if (existing.has(hash)) {
      skippedDuplicates += 1;
      continue;
    }
    insert.run(row.company, row.email, hash, now, now, uploadId);
    existing.add(hash);
    imported += 1;
  }

  const skipped = skippedDuplicates + skippedInvalid;
  database
    .prepare("update outreach_uploads set rows_imported = ?, rows_skipped = ? where id = ?")
    .run(imported, skipped, uploadId);
  addEvent("upload", null, null, {upload_id: uploadId, rows_total: rows.length, imported, skipped});

  return {
    upload_id: uploadId,
    rows_total: rows.length,
    imported,
    skipped_duplicates: skippedDuplicates,
    skipped_invalid: skippedInvalid
  };
}
