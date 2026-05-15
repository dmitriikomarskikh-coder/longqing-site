# Private outreach dashboard

This is a closed management area for LONGQING MTU outreach. It is not linked from public navigation and must not be indexed.

## Hidden entry

- Open `/en`.
- In the Supply geography / Geography map, click Australia 7 times.
- The click counter lives only in React state and is not stored in localStorage.
- After the 7th click, the browser opens `/en/private/auth`.

The hidden entry is only a convenience route. Security depends on passkey auth and server-side session checks.

## Local setup

Set local env values without committing them:

```bash
LONGQING_PRIVATE_ENABLED=true
LONGQING_ADMIN_SETUP_TOKEN=<local setup token>
LONGQING_AUTH_RP_ID=localhost
LONGQING_AUTH_ORIGIN=http://localhost:3000
LONGQING_AUTH_DATA_DIR=.data/private-auth
LONGQING_OUTREACH_DB_PATH=.data/outreach/outreach.sqlite
```

Start local dev server and open:

```text
http://localhost:3000/en/private/auth?setup=<local setup token>
```

Register the owner passkey. After registration, the setup registration button is no longer shown.

## Login

Open `/en/private/auth` and use “Войти по passkey”. A successful login creates an HttpOnly session cookie for 7 days.

## Upload Excel

Open `/en/private/outreach`.

Upload `.xlsx` or `.csv`:

- column A: company
- column B: email
- optional first row headers: `company,email`

Upload does not start sending. Imported rows get `status=queued`.

## Queue and reports

Dashboard sections:

- Status cards: running/paused, Moscow time, today sent, queue/sent/errors.
- Settings: Moscow schedule, weekdays, random delay, daily limit, copy approval.
- Queue table: queued recipients.
- Sent table: sent recipients.
- Errors table: recipients with sanitized errors.
- Template preview: read-only subject variants and rendered copy.
- Event log: latest sanitized events.

## Start/Pause

Start only enables scheduler settings. It does not bypass:

- schedule window;
- daily limit;
- SMTP/IMAP env checks;
- copy approval;
- empty queue guard;
- mandatory Sent append guard.

Pause sets `enabled=false`.

## Worker

Later in production, run a separate PM2 process such as:

```bash
npm run outreach:worker
```

Planned PM2 name: `longqing-outreach-worker`.

Do not start the worker until:

- passkey owner is registered;
- production env is set;
- one test-send with IMAP append is successful;
- first queue is reviewed;
- copy/template is approved.

## Production env

Required production env values:

```bash
LONGQING_PRIVATE_ENABLED=true
LONGQING_ADMIN_SETUP_TOKEN=
LONGQING_AUTH_RP_ID=longqingtrade.com
LONGQING_AUTH_ORIGIN=https://longqingtrade.com
LONGQING_AUTH_DATA_DIR=/var/lib/longqingtrade/private-auth
LONGQING_OUTREACH_DB_PATH=/var/lib/longqingtrade/outreach/outreach.sqlite
LONGQING_SESSION_SECRET=<strong secret>

SMTP_HOST=smtp.timeweb.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=office@longqingtrade.com
SMTP_PASS=<env only>
SMTP_FROM=LONGQING TRADE <office@longqingtrade.com>
SMTP_REPLY_TO=office@longqingtrade.com

IMAP_HOST=imap.timeweb.ru
IMAP_PORT=993
IMAP_SECURE=true
IMAP_USER=office@longqingtrade.com
IMAP_PASS=<env only>

OUTREACH_SEND_ENABLED=false
OUTREACH_REQUIRE_SENT_APPEND=true
OUTREACH_BCC_ARCHIVE=
```

Do not put passwords in chat, docs, git, dashboard fields, or uploaded files.

## Do not do

- Do not enable sending without a fresh test-send.
- Do not send direct mail from VPS.
- Do not set small intervals.
- Do not upload unverified lead lists.
- Do not deploy from this implementation task.
- Do not start PM2 worker from this implementation task.
