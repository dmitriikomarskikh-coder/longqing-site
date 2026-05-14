# Outreach deliverability rules

- One email means one recipient.
- Do not send mass `To`, `Cc`, or multi-recipient messages.
- Keep `OUTREACH_BCC_ARCHIVE` empty by default. Use Bcc only if it is explicitly set for a specific controlled test.
- For real sending, archive sent messages through IMAP Sent append. Batch sending requires `OUTREACH_REQUIRE_SENT_APPEND=true`.
- Keep 90–180 seconds between real batch messages.
- Start with 10 recipients in the first batch.
- Then move to 20–30 recipients per day only after checking replies, bounces, and spam placement.
- Do not scale to 300 recipients until early results are stable.
- Check bounces, replies, spam-folder reports, and opt-outs after every batch.
- Avoid spammy words, all-caps subjects, pressure wording, and misleading claims.
- Do not use tracking pixels at the start.
- Do not use URL shorteners.
- Do not attach heavy files in the first cold email. A short table in the body is safer.
- Use only Timeweb SMTP relay. Do not use VPS local mail, sendmail, Postfix, or direct SMTP from `72.56.240.202`.
- If IMAP Sent append does not work, do not run batch sending. Fix IMAP first and confirm in Timeweb webmail that the test email appears in “Отправленные” / Sent.
- Do not change DMARC from `p=none` during these first tests.
