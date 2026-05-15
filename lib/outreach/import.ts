import * as XLSX from "xlsx";
import {getOutreachDb, emailHash, addEvent} from "@/lib/outreach/db";
import {isValidOutreachEmail} from "@/lib/outreach/template";

type ParsedRow = {
  company: string;
  email: string;
};

function parseCsv(buffer: Buffer) {
  return buffer
    .toString("utf8")
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
}

function rowsFromWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, {type: "buffer"});
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json<string[]>(firstSheet, {header: 1, raw: false, blankrows: false});
}

function normalizeRows(rows: string[][]): ParsedRow[] {
  const [first, ...rest] = rows;
  if (!first) {
    return [];
  }
  const hasHeader = first[0]?.toLowerCase() === "company" && first[1]?.toLowerCase() === "email";
  return (hasHeader ? rest : rows).map((row) => ({
    company: (row[0] ?? "").trim(),
    email: (row[1] ?? "").trim().toLowerCase()
  }));
}

export async function importRecipientsFile(file: File) {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("File exceeds 2 MB");
  }
  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".xlsx") && !lower.endsWith(".csv")) {
    throw new Error("Only .xlsx and .csv are supported");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const rows = normalizeRows(lower.endsWith(".xlsx") ? rowsFromWorkbook(buffer) : parseCsv(buffer));
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
