// POST /api/admin {action, …} with header x-admin-key → the owner's dashboard actions.
import { json, body, clean, cfg, DAY, offer, refreshStats, createMember, getMember, saveMember, normCode, siteUrl } from "../lib/core.mjs";
import { listJSON, store } from "../lib/store.mjs";
import { registerWebhook, safeEqual } from "../lib/ziina.mjs";
import { sendEmail, codeEmail, emailReady } from "../lib/email.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass || pass.length < 8) return json({ error: "Set ADMIN_PASSWORD (8+ characters) in Netlify first." }, 503);
  if (!safeEqual(req.headers.get("x-admin-key") || "", pass)) return json({ error: "Wrong password" }, 401);
  const b = await body(req);
  const code = normCode(b.code);

  switch (b.action) {
    case "summary": {
      const [members, waitlist, orders] = await Promise.all([listJSON("member/"), listJSON("waitlist/"), listJSON("order/")]);
      await refreshStats();
      return json({
        offer: await offer(), settings: cfg(),
        emailReady: emailReady(), ziinaReady: !!process.env.ZIINA_API_KEY, ziinaTest: process.env.ZIINA_TEST === "1",
        members: members.sort((a, b) => b.created - a.created),
        waitlist: waitlist.sort((a, b) => b.at - a.at),
        orders: orders.sort((a, b) => b.created - a.created).slice(0, 100)
      });
    }
    case "create": {
      const days = Math.max(1, Math.min(3650, Number(b.days) || 365));
      const plan = ["early", "founding", "regular", "gift"].includes(b.plan) ? b.plan : "gift";
      const m = await createMember({ name: b.name, email: b.email, phone: b.phone, plan, price: Number(b.price) || 0, source: "admin", days, note: b.note });
      let emailed = false;
      if (b.sendEmail && m.email) emailed = (await sendEmail({ to: m.email, ...codeEmail(m) })).sent;
      return json({ member: m, emailed, link: siteUrl() + "/app/?code=" + m.code });
    }
    case "approve": case "approveAll": {
      const days = Math.max(1, Math.min(365, Number(process.env.EARLY_DAYS || 21)));
      const waiting = (await listJSON("waitlist/")).filter(w => w.id && !w.code && (b.action === "approveAll" || w.id === b.id));
      if (!waiting.length) return json({ error: b.action === "approveAll" ? "No one is waiting." : "That sign-up was not found or already has a code." }, 404);
      const done = [];
      for (const w of waiting) {
        const m = await createMember({ name: w.name, email: w.email || (/@/.test(w.contact || "") ? w.contact : ""), phone: w.phone || (!/@/.test(w.contact || "") ? w.contact : ""),
          plan: "early", price: 0, source: "waitlist", days, note: [w.age && "age " + w.age, w.country, w.meet && "wants Meet"].filter(Boolean).join(", ") });
        const r = m.email ? await sendEmail({ to: m.email, ...codeEmail(m) }) : { sent: false, reason: "no email" };
        await store().setJSON("waitlist/" + w.id, { ...w, code: m.code, approvedAt: Date.now(), emailed: r.sent, emailError: r.sent ? "" : r.reason });
        done.push({ member: m, emailed: r.sent, reason: r.reason });
      }
      return json({ approved: done });
    }
    case "resend": {
      const m = code && (await getMember(code));
      if (!m || !m.email) return json({ error: "No email address for this code." }, 404);
      const r = await sendEmail({ to: m.email, ...codeEmail(m) });
      return r.sent ? json({ ok: true }) : json({ error: "Email not sent: " + r.reason }, 502);
    }
    case "extend": case "revoke": case "restore": case "resetDevices": {
      const m = code && (await getMember(code));
      if (!m) return json({ error: "Code not found" }, 404);
      if (b.action === "extend") m.until = Math.max(Date.now(), m.until) + Math.max(1, Math.min(3650, Number(b.days) || 365)) * DAY;
      if (b.action === "revoke") m.revoked = true;
      if (b.action === "restore") m.revoked = false;
      if (b.action === "resetDevices") m.devices = [];
      await saveMember(m);
      if (b.action !== "resetDevices") await refreshStats();
      return json({ member: m });
    }
    case "registerWebhook": {
      try {
        const r = await registerWebhook(siteUrl() + "/api/ziina-webhook", process.env.ZIINA_WEBHOOK_SECRET);
        return json({ ok: true, result: r });
      } catch (e) { return json({ error: String(e.message || e) }, 502); }
    }
    default: return json({ error: "Unknown action" }, 400);
  }
};
export const config = { path: "/api/admin" };
