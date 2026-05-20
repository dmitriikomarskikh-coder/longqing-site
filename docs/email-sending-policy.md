# Email Sending Policy

This project defaults to personal/manual/first-touch delivery.

## Personal/default mode

Unless explicitly configured otherwise, outgoing SMTP messages and IMAP Sent copies must not include list or bulk headers:

- `Precedence`
- `List-Unsubscribe`
- `List-ID`
- `List-Help`
- `List-Subscribe`

## Bulk mode

Bulk headers are opt-in only:

```env
OUTREACH_HEADER_MODE=bulk
OUTREACH_LIST_UNSUBSCRIBE=mailto:office@longqingtrade.com?subject=unsubscribe
```

`OUTREACH_LIST_UNSUBSCRIBE` is accepted only when it is a supported `mailto:` URL and its email domain is aligned with the sender identity (`SMTP_USER`, `SMTP_FROM`, `SMTP_REPLY_TO`, or `IMAP_USER`). If validation fails, the sender skips list/bulk headers and logs a warning without secrets.

SMTP headers and the raw MIME message appended to IMAP Sent use the same policy.

## Templates

Commercial copy and templates are not changed by this policy. Stock tables are inserted only when the template explicitly contains the stock-list variable, such as `{{СписокПозиций}}`.
