import type {SubmissionPayload} from "./email";

export async function sendCrm(payload: SubmissionPayload) {
  void payload;
  // TODO: Connect a concrete CRM when selected by the customer.
  return {channel: "crm", skipped: true};
}
