// GET /api/claim?pi=… → called by the thank-you page. Checks the payment with Ziina and hands over the code.
import { json, getOrder, fulfil, getMember } from "../lib/core.mjs";
import { getPaymentIntent } from "../lib/ziina.mjs";
import { sendEmail, welcomeEmail } from "../lib/email.mjs";

export default async req => {
  const pi = new URL(req.url).searchParams.get("pi") || "";
  const order = pi && (await getOrder(pi));
  if (!order) return json({ status: "unknown" }, 404);
  let result;
  if (order.status === "fulfilled") result = { member: await getMember(order.code), fresh: false };
  else {
    let intent;
    try { intent = await getPaymentIntent(pi); } catch (e) { console.error(e); return json({ status: "pending" }); }
    result = await fulfil(order, intent);
    if (!result.member) return json({ status: result.status || "pending" });
  }
  const m = result.member;
  let emailed = false;
  if (result.fresh) emailed = (await sendEmail({ to: m.email, ...welcomeEmail(m) })).sent;
  return json({ status: "completed", kind: order.kind, code: m.code, until: m.until, plan: m.plan, emailed });
};
export const config = { path: "/api/claim" };
