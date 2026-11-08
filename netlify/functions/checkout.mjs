// POST /api/checkout {name, email, phone, renew?} → creates a Ziina payment and returns its page.
import { json, body, clean, validEmail, offer, siteUrl, normCode, getMember, saveOrder } from "../lib/core.mjs";
import { createPaymentIntent } from "../lib/ziina.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const b = await body(req);
  const name = clean(b.name, 60), email = clean(b.email, 120).toLowerCase(), phone = clean(b.phone, 30);
  let order;
  if (b.renew) {
    const code = normCode(b.renew);
    const m = code && (await getMember(code));
    if (!m) return json({ error: "We couldn't find that code. Check it and try again." }, 404);
    if (m.revoked) return json({ error: "This code can't be renewed. Please message us." }, 403);
    const o = await offer();
    const paying = m.plan === "founding" || m.plan === "regular";
    if (!paying && !o.sale) return json({ error: "Founding-family spots open soon. We'll message you first." }, 409);
    // a paying family keeps the price they joined at; early-access and gift families get today's offer
    const plan = paying ? m.plan : o.plan;
    const locked = paying && m.price >= 2 ? m.price : null;
    order = { kind: "renew", code: m.code, plan,
      price: locked || (plan === "founding" ? o.foundingPrice : o.regularPrice),
      name: m.name || name, email: m.email || email, phone: m.phone || phone };
  } else {
    const o = await offer();
    if (!o.sale) return json({ error: "Sales aren't open yet. Join the waitlist and we'll message you first." }, 409);
    if (!name || !validEmail(email)) return json({ error: "Please add your name and a valid email, so we can send your code." }, 400);
    order = { kind: "new", plan: o.plan, price: o.price, name, email, phone };
  }
  try {
    const pi = await createPaymentIntent({
      aed: order.price,
      successUrl: siteUrl() + "/thanks/?pi={PAYMENT_INTENT_ID}",
      cancelUrl: siteUrl() + (order.kind === "renew" ? "/?renew=" + order.code : "/?cancelled=1#pricing")
    });
    await saveOrder({ ...order, pi: pi.id, status: "open", created: Date.now() });
    return json({ url: pi.redirect_url });
  } catch (e) {
    console.error(e);
    return json({ error: "Payment page couldn't open. Please try again in a minute." }, 502);
  }
};
export const config = { path: "/api/checkout" };
