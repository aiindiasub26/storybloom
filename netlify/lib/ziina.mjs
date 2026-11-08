// Ziina API (https://docs.ziina.com). Amounts are sent in fils: AED 39 = 3900.
const base = () => (process.env.ZIINA_API_BASE || "https://api-v2.ziina.com/api").replace(/\/$/, "");

async function call(method, path, body) {
  const key = process.env.ZIINA_API_KEY;
  if (!key) throw new Error("ZIINA_API_KEY is not set");
  const res = await fetch(base() + path, {
    method,
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!res.ok) throw new Error(`Ziina ${method} ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  return data;
}

export function createPaymentIntent({ aed, successUrl, cancelUrl }) {
  return call("POST", "/payment_intent", {
    amount: Math.round(aed * 100),
    currency_code: "AED",
    success_url: successUrl,
    cancel_url: cancelUrl,
    test: process.env.ZIINA_TEST === "1"
  });
}

export const getPaymentIntent = id => call("GET", "/payment_intent/" + encodeURIComponent(id));

export const registerWebhook = (url, secret) => call("POST", "/webhook", secret ? { url, secret } : { url });

// Ziina signs webhook bodies with HMAC-SHA256 (hex) in the X-Hmac-Signature header.
export async function validSignature(rawBody, header, secret) {
  if (!secret) return true;
  if (!header) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(rawBody)));
  const hex = [...sig].map(b => b.toString(16).padStart(2, "0")).join("");
  return safeEqual(hex, String(header).trim().toLowerCase());
}

export function safeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
