// Runs once a day: emails renewal reminders 14 days and 3 days before a family's year ends.
import { DAY, saveMember } from "../lib/core.mjs";
import { listJSON } from "../lib/store.mjs";
import { sendEmail, renewEmail, emailReady } from "../lib/email.mjs";

export default async () => {
  if (!emailReady()) return new Response("email not set up");
  const now = Date.now();
  let sent = 0;
  for (const m of await listJSON("member/")) {
    if (m.revoked || !m.email || m.plan === "early" || m.until < now) continue;
    const days = Math.ceil((m.until - now) / DAY);
    const slot = days <= 3 ? "d3" : days <= 14 ? "d14" : null;
    if (!slot || (m.reminders || {})[slot]) continue;
    const r = await sendEmail({ to: m.email, ...renewEmail(m, days) });
    if (r.sent) { m.reminders = { ...(m.reminders || {}), [slot]: now, ...(slot === "d3" ? { d14: now } : {}) }; await saveMember(m); sent++; }
  }
  return new Response("sent " + sent);
};
export const config = { schedule: "@daily" };
