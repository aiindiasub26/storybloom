// POST /api/redeem {code, device} → checks a code and returns a signed pass for this device.
import { json, body, normCode, getMember, saveMember, memberState, attachDevice, issuePass, siteUrl } from "../lib/core.mjs";

export default async req => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const b = await body(req);
  const code = normCode(b.code), device = String(b.device || "").slice(0, 64);
  if (!code || !device) return json({ status: "invalid", error: "That doesn't look like a StoryBloom code (BLOOM-XXXX-XXXX)." }, 400);
  const m = await getMember(code);
  const state = memberState(m);
  if (state === "unknown") return json({ status: "invalid", error: "We couldn't find that code. Check the letters and try again." }, 404);
  if (state === "revoked") return json({ status: "revoked", error: "This code has been switched off. Please message us." }, 403);
  if (state === "expired") return json({ status: "expired", error: "This code's year has ended.", renewUrl: siteUrl() + "/storybloom/?renew=" + m.code }, 403);
  if (attachDevice(m, device)) return json({ status: "device_limit", error: "This code is already on the maximum number of devices. Message us and we'll reset it." }, 403);
  await saveMember(m);
  const p = await issuePass(m, device, req);
  return json({ status: "ok", pass: p.token, serverTime: Date.now() }, 200, { "Set-Cookie": p.cookie });
};
export const config = { path: "/api/redeem" };
