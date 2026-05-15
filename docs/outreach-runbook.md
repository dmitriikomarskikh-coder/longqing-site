# LONGQING MTU outreach runbook

This runbook covers the CLI outreach module for MTU spare-parts B2B email. It is not a public website feature.

## Already checked

- Mail-tester score via Timeweb webmail: `10/10`.
- Test-send score via Timeweb SMTP relay: `9.7/10`.
- Sending IP shown by the latest SMTP test: `92.53.116.15`.
- HELO shown by the latest SMTP test: `smtpout5.timeweb.ru`.
- SPF: pass.
- DKIM: pass.
- DMARC: pass.
- SpamAssassin: No / `-0.2/5.0`.

## Do not do

- Do not use VPS `72.56.240.202` as a mail server.
- Do not use sendmail, Postfix, local mail, or direct SMTP from the VPS.
- Do not send a batch before a successful `test-send` through this script.
- Do not change DNS, DKIM, SPF, or DMARC from this module.
- Do not print SMTP or IMAP passwords.
- Do not pass SMTP or IMAP passwords through chat. Enter them locally in a terminal or local environment.
- Do not commit real recipients, suppression lists, logs, XLSX/PDF stock files, or commercial data.
- Do not rely on Bcc copies as the primary archive. Use IMAP append to Sent / “Отправленные”.

## Dry-run

Create `data/outreach/recipients.csv` from `data/outreach/recipients.example.csv`, or run dry-run with only the example file:

```bash
npm run outreach:dry-run
```

Dry-run does not send email and does not require `SMTP_PASS`. It generates previews, checks validation, applies suppression rules, and writes `.logs/outreach-email.jsonl`.

## Private dashboard

The dashboard foundation is available at `/en/private/outreach` after passkey login. The hidden entry is on `/en`: click Australia 7 times in the Geography map, then register or login at `/en/private/auth`.

The dashboard supports Excel upload, queue review, settings, start/pause, template preview, sent/error tables, and recent events. It does not store SMTP or IMAP secrets in SQLite.

## One test email to mail-tester

1. Open mail-tester and copy the generated address.
2. Put it in `.env.outreach` as `OUTREACH_TEST_RECIPIENT`.
3. Set `OUTREACH_SEND_ENABLED=true`.
4. Set Timeweb SMTP and IMAP passwords through local terminal environment variables; do not write them in chat or commit them.
5. Keep `OUTREACH_REQUIRE_SENT_APPEND=true` if you want the test message to be saved in Sent / “Отправленные”.
6. Run:

```bash
npm run outreach:test-send
```

The command sends exactly one email to `OUTREACH_TEST_RECIPIENT`. It never sends to customers. In mail-tester headers, verify Timeweb SMTP infrastructure is used, not VPS `72.56.240.202`.

If `OUTREACH_REQUIRE_SENT_APPEND=true` and `IMAP_PASS` is missing, `test-send` stops before SMTP. After a successful test, check Timeweb webmail and confirm the message appears in Sent / “Отправленные”.

Expected signs:

- external IP belongs to Timeweb mail infrastructure;
- HELO is Timeweb SMTP/webmail infrastructure;
- SPF, DKIM, and DMARC pass.

## One test email to a control mailbox

Set `OUTREACH_TEST_RECIPIENT` to the control mailbox, keep `OUTREACH_SEND_ENABLED=true`, and run:

```bash
npm run outreach:test-send
```

Check delivery, formatting, unsubscribe sentence, and whether the copy appears as expected.
Also check Timeweb webmail Sent / “Отправленные”.

## First real batch

Before the first batch:

1. Prepare `data/outreach/recipients.csv`.
2. Prepare `data/outreach/suppression.csv`.
3. Run `npm run outreach:dry-run`.
4. Run at least one successful `npm run outreach:test-send`.
5. Confirm there are no forbidden claims in the email copy.
6. Confirm Sent append works in Timeweb webmail.

Then set:

```bash
OUTREACH_SEND_ENABLED=true
OUTREACH_BATCH_CONFIRMATION=SEND_LONGQING_MTU_BATCH
OUTREACH_BATCH_LIMIT=10
OUTREACH_REQUIRE_SENT_APPEND=true
OUTREACH_BCC_ARCHIVE=
```

Run:

```bash
npm run outreach:batch-send
```

The default delay is 90–180 seconds between messages. Do not send more than 10 in the first batch.

For `batch-send`, `OUTREACH_REQUIRE_SENT_APPEND=true` is mandatory. Before the first SMTP send, the CLI connects to IMAP, finds Sent / “Отправленные”, and stops if the folder is not available. If SMTP succeeds but append to Sent fails for any message, the CLI records `sent_append_status=failed...`, marks the recipient with an error, and stops the batch.

`OUTREACH_BCC_ARCHIVE` is empty by default. Set it only when a Bcc fallback is explicitly needed for a controlled test.

## Replies and opt-outs

If a recipient replies with `неактуально`, an opt-out, a bounce, or a do-not-contact request, add the email to `data/outreach/suppression.csv`:

```csv
email,reason,created_at
name@example.ru,unsubscribed,2026-05-14T00:00:00.000Z
```

Also update `recipients.csv` status if the recipient is present there.

## Report

```bash
npm run outreach:report
```

The report shows total recipients, sent, skipped, errors, unsubscribed, do_not_contact, bounced, and last sent time. It does not print secrets.

## Why DMARC p=none stays unchanged

`p=none` is suitable while validating early sending, reply handling, and deliverability. Move to stricter DMARC only after enough real mail flow is confirmed and all legitimate senders are covered by SPF/DKIM alignment.

## Attachments

For first cold outreach, avoid heavy attachments. Use the short stock table in the body. If `OUTREACH_ATTACH_STOCK_LIST=true`, the CLI allows only `.pdf`, `.xlsx`, or `.csv`, max 500 KB, and blocks files containing internal columns such as `source_urls`, `research_notes`, `confidence`, `publish_status`, `internal`, `cost`, `margin`, or `supplier_private_notes`.
