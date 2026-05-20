import assert from "node:assert/strict";
import {buildEmailDeliveryHeaders, listManagedDeliveryHeaders} from "../lib/outreach/delivery-headers";

const identity = {
  smtpUser: "office@longqingtrade.com",
  smtpFrom: "LONGQING TRADE <office@longqingtrade.com>",
  smtpReplyTo: "office@longqingtrade.com",
  imapUser: "office@longqingtrade.com"
};

function build(mode?: string, listUnsubscribe?: string) {
  return buildEmailDeliveryHeaders({mode, listUnsubscribe, identity});
}

assert.deepEqual(build().headers, {});
assert.equal(build().rawHeaderLines.some((line) => /^(Precedence|List-Unsubscribe|List-ID|List-Help|List-Subscribe):/i.test(line)), false);
assert.deepEqual(listManagedDeliveryHeaders(), ["Precedence", "List-Unsubscribe", "List-ID", "List-Help", "List-Subscribe"]);

assert.deepEqual(build("personal", "mailto:office@longqingtrade.com?subject=unsubscribe").headers, {});
assert.deepEqual(build("bulk").headers, {});
assert.deepEqual(build("bulk", "mailto:office@ip-komarskikh.ru?subject=unsubscribe").headers, {});

const aligned = build("bulk", "mailto:office@longqingtrade.com?subject=unsubscribe");
assert.deepEqual(aligned.headers, {
  "List-Unsubscribe": "<mailto:office@longqingtrade.com?subject=unsubscribe>",
  Precedence: "bulk"
});
assert.deepEqual(aligned.rawHeaderLines, [
  "List-Unsubscribe: <mailto:office@longqingtrade.com?subject=unsubscribe>",
  "Precedence: bulk"
]);

console.log("email header checks passed");
