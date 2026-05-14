# LONGQING MTU outreach runbook

This runbook covers the CLI outreach module for MTU spare-parts B2B email. It is not a public website feature.

## Already checked

- Mail-tester score via Timeweb webmail: `10/10`.
- Sending IP shown by mail-tester: `92.53.116.132`.
- HELO shown by mail-tester: `smtp-web-out-1.timeweb.ru`.
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
- Do not commit real recipients, suppression lists, logs, XLSX/PDF stock files, or commercial data.

## Dry-run

Create `data/outreach/recipients.csv` from `data/outreach/recipients.example.csv`, or run dry-run with only the example file:

```bash
npm run outreach:dry-run
```

Dry-run does not send email and does not require `SMTP_PASS`. It generates previews, checks validation, applies suppression rules, and writes `.logs/outreach-email.jsonl`.

## One test email to mail-tester

1. Open mail-tester and copy the generated address.
2. Put it in `.env.outreach` as `OUTREACH_TEST_RECIPIENT`.
3. Set `OUTREACH_SEND_ENABLED=true`.
4. Set Timeweb SMTP and IMAP passwords in local environment or `.env.outreach`; do not commit them.
5. Run:

```bash
npm run outreach:test-send
```

The command sends exactly one email to `OUTREACH_TEST_RECIPIENT`. It never sends to customers. In mail-tester headers, verify Timeweb SMTP infrastructure is used, not VPS `72.56.240.202`.

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

## First real batch

Before the first batch:

1. Prepare `data/outreach/recipients.csv`.
2. Prepare `data/outreach/suppression.csv`.
3. Run `npm run outreach:dry-run`.
4. Run at least one successful `npm run outreach:test-send`.
5. Confirm there are no forbidden claims in the email copy.

Then set:

```bash
OUTREACH_SEND_ENABLED=true
OUTREACH_BATCH_CONFIRMATION=SEND_LONGQING_MTU_BATCH
OUTREACH_BATCH_LIMIT=10
```

Run:

```bash
npm run outreach:batch-send
```

The default delay is 90–180 seconds between messages. Do not send more than 10 in the first batch.

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
