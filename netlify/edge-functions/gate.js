// Edge gate for /app/*: the app's content (stories, songs, pictures, printables, game code)
// is only served to a browser holding a valid signed pass cookie. The small app shell
// (page, styles, unlock screen) stays public so the unlock screen can load.
import { readPass, parseJwk, publicJwk } from "../lib/pass.mjs";

const PUBLIC = new Set([
  "/app/", "/app/index.html", "/app/manifest.webmanifest", "/app/sw.js",
  "/app/css/app.css", "/app/js/access.js", "/app/js/pass-key.js",
  "/app/assets/img/icon-192.png", "/app/assets/img/icon-512.png"
]);
const isPublic = p => PUBLIC.has(p) || p.startsWith("/app/assets/fonts/");

let pub;
function key() {
  if (pub === undefined) {
    const jwk = parseJwk(Netlify.env.get("PASS_PRIVATE_JWK"));
    pub = jwk ? publicJwk(jwk) : null;
  }
  return pub;
}

export default async (req, context) => {
  const path = new URL(req.url).pathname;
  if (isPublic(path)) return context.next();
  const token = context.cookies.get("sb_pass");
  const p = await readPass(token, key());
  const now = Date.now();
  if (p && now < p.u && now < p.k) return context.next();
  return new Response("StoryBloom is locked on this device. Open unscrolled.me/app to unlock.", {
    status: 401, headers: { "Content-Type": "text/plain", "Cache-Control": "no-store" }
  });
};

export const config = { path: "/app/*" };
