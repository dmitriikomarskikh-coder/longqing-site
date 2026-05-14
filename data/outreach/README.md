# Outreach data

This directory contains examples for the LONGQING MTU outreach CLI.

Do not commit real contact bases, suppression lists, logs, XLSX/PDF stock files, or commercial files. Real files are ignored by git:

- `data/outreach/recipients.csv`
- `data/outreach/suppression.csv`
- `data/outreach/*.xlsx`
- `data/outreach/*.pdf`
- `.logs/outreach-email.jsonl`

## recipients.csv

Required columns:

```csv
company,email,contact_name,segment,city,note,status,last_sent_at,error
```

Allowed `status` values:

- empty
- `new`
- `sent`
- `test`
- `skipped`
- `error`
- `replied`
- `bounced`
- `unsubscribed`
- `do_not_contact`

The sender only considers rows with empty status or `new`. It skips `sent`, `replied`, `bounced`, `unsubscribed`, `do_not_contact`, and `error`.

Emails are validated, deduplicated case-insensitively, and checked against `suppression.csv` before sending.

## suppression.csv

Required columns:

```csv
email,reason,created_at
```

Add any address that replied with an opt-out, bounced, or must not be contacted again.

## First 30 companies

Prepare the first 30 recipients manually:

1. Confirm the company is relevant to MTU repairs, power generation, mining, marine, industrial service, or spare parts procurement.
2. Use one direct business email per company.
3. Avoid personal addresses unless the contact is already business-related.
4. Start with `status=new`.
5. Run `npm run outreach:dry-run` before any send mode.

Never paste SMTP passwords or private customer lists into docs, commits, issue trackers, or chat logs.
