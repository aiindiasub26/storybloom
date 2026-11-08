// POST /api/ziina-webhook → Ziina tells us a payment changed. Backup for parents who close the tab before the thank-you page.
import { json, getOrder, fulfil } from "../lib/core.mjs";
import { getPaymentIntent, validSignature } from "../lib/ziina.mjs";
import { sendEmail, welcomeEmail } from "../lib/email.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const raw = await req.text();
  if (!(await validSignature(raw, req.headers.get("x-hmac-signature"), process.env.ZIINA_WEBHOOK_SECRET))) return json({ error: "bad signature" }, 401);
  let evt; try { evt = JSON.parse(raw); } catch { return json({ error: "bad json" }, 400); }
  if (evt.event !== "payment_intent.status.updated" || !evt.data || evt.data.status !== "completed") return json({ ok: true });
  const order = await getOrder(evt.data.id);
  if (!order || order.status === "fulfilled") return json({ ok: true });
  const intent = await getPaymentIntent(evt.data.id); // re-check with Ziina rather than trusting the message
  const r = await fulfil(order, intent);
  if (r.fresh) await sendEmail({ to: r.member.email, ...welcomeEmail(r.member) });
  return json({ ok: true });
};
export const config = { path: "/api/ziina-webhook" };
