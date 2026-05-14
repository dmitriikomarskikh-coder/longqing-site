# Outreach deliverability rules

- One email means one recipient.
- Do not send mass `To`, `Cc`, or multi-recipient messages.
- Use `Bcc` only for `OUTREACH_BCC_ARCHIVE`, typically `office@longqingtrade.com`.
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
- Do not change DMARC from `p=none` during these first tests.
