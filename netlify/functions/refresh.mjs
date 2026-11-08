// POST /api/refresh {pass, device} → the app calls this whenever it's online, to renew its pass and pick up renewals or cancellations.
import { json, body, readToken, getMember, saveMember, memberState, attachDevice, issuePass, siteUrl } from "../lib/core.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const b = await body(req);
  const old = await readToken(b.pass);
  const device = String(b.device || "").slice(0, 64);
  if (!old || old.d !== device) return json({ status: "invalid" }, 401);
  const m = await getMember(old.c);
  const state = memberState(m);
  if (state === "unknown" || state === "revoked") return json({ status: "revoked", serverTime: Date.now() }, 403);
  if (state === "expired") return json({ status: "expired", renewUrl: siteUrl() + "/storybloom/?renew=" + m.code, serverTime: Date.now() }, 403);
  if (attachDevice(m, device)) return json({ status: "device_removed", serverTime: Date.now() }, 403);
  await saveMember(m);
  const p = await issuePass(m, device);
  return json({ status: "ok", pass: p.token, serverTime: Date.now() }, 200, { "Set-Cookie": p.cookie });
};
export const config = { path: "/api/refresh" };
