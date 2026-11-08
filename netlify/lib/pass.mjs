// Signed access passes (ECDSA P-256 / SHA-256). Pure WebCrypto, so the same file
// runs in Netlify Functions (Node), the edge gate (Deno) and is mirrored in the app.
// A pass looks like  base64url(JSON payload) + "." + base64url(signature)
// payload: { c: code, d: device id, p: plan, u: paid-until (ms), k: check-in-by (ms), i: issued (ms) }

const ALG = { name: "ECDSA", namedCurve: "P-256" };
const SIG = { name: "ECDSA", hash: "SHA-256" };
const enc = new TextEncoder();
const dec = new TextDecoder();

export function b64u(bytes) {
  let s = "";
  const a = new Uint8Array(bytes);
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function unb64u(str) {
  const s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  return Uint8Array.from(atob(s + pad), c => c.charCodeAt(0));
}

export function parseJwk(raw) {
  if (!raw) return null;
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return null; }
}
export function publicJwk(jwk) {
  return { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };
}

const keyCache = new Map();
async function importKey(jwk, usage) {
  const id = usage + ":" + jwk.x + (jwk.d ? ":d" : "");
  if (!keyCache.has(id)) {
    const clean = usage === "sign" ? { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y, d: jwk.d } : publicJwk(jwk);
    keyCache.set(id, crypto.subtle.importKey("jwk", clean, ALG, false, [usage]));
  }
  return keyCache.get(id);
}

export async function signPass(payload, privateJwk) {
  const body = b64u(enc.encode(JSON.stringify(payload)));
  const key = await importKey(privateJwk, "sign");
  const sig = await crypto.subtle.sign(SIG, key, enc.encode(body));
  return body + "." + b64u(sig);
}

// Returns the payload if the signature is valid (dates are NOT checked here), else null.
export async function readPass(token, jwk) {
  try {
    if (!token || !jwk) return null;
    const [body, sig] = String(token).split(".");
    if (!body || !sig) return null;
    const key = await importKey(jwk, "verify");
    const ok = await crypto.subtle.verify(SIG, key, unb64u(sig), enc.encode(body));
    return ok ? JSON.parse(dec.decode(unb64u(body))) : null;
  } catch {
    return null;
  }
}

export async function generateKeyJwk() {
  const kp = await crypto.subtle.generateKey(ALG, true, ["sign", "verify"]);
  return crypto.subtle.exportKey("jwk", kp.privateKey);
}
