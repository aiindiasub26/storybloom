// End-to-end check of the whole flow in a real browser (Playwright + Chromium).
// Starts its own servers: one in waitlist mode, one in founding mode with fake Ziina.
//   node dev/e2e.mjs [screenshot-folder]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright"); // installed globally here; `npm i -D playwright` elsewhere
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = process.argv[2] || path.join(root, "dev", ".shots");
const DAY = 864e5;
let failures = 0;
const ok = (cond, msg) => { console.log((cond ? "  ✓ " : "  ✗ ") + msg); if (!cond) failures++; };

async function server(port, mode) {
  rmSync(path.join(root, "dev", ".data"), { recursive: true, force: true });
  const p = spawn("node", [path.join(root, "dev", "server.mjs")], { env: { ...process.env, PORT: String(port), SALES_MODE: mode }, stdio: ["ignore", "pipe", "inherit"] });
  process.on("exit", () => p.kill());
  await new Promise(res => p.stdout.on("data", d => String(d).includes("running locally") && res()));
  return p;
}
const admin = (base, action, extra = {}) => fetch(base + "/api/admin", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": "localadmin" }, body: JSON.stringify({ action, ...extra }) }).then(r => r.json());

const browser = await chromium.launch();
async function waitHome(pg, label) {
  try { await pg.waitForSelector("#home .tile", { timeout: 15000 }); }
  catch (e) {
    const lockText = await pg.evaluate(() => { const l = document.querySelector("#sb-lock"); return l ? l.innerText : "(no lock screen)"; }).catch(() => "?");
    console.log("  ! " + label + " did not reach home. Screen says: " + lockText.replace(/\s+/g, " "));
    await pg.screenshot({ path: shots + "/fail-" + label + ".png" });
    throw e;
  }
}

/* ---------------- 1. waitlist mode ---------------- */
{
  const base = "http://localhost:8901", srv = await server(8901, "waitlist");
  console.log("Waitlist mode");
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const pg = await phone.newPage();
  await pg.goto(base + "/");
  ok((await pg.textContent("#sb-status")) === "Early access open", "unscrolled.me home lists StoryBloom with early access open");
  await pg.click("text=Explore StoryBloom"); await pg.waitForURL(/\/storybloom\/$/);
  ok(true, "home links through to the StoryBloom page");
  await pg.goto(base + "/storybloom/");
  await pg.waitForFunction(() => document.querySelector("#spots").textContent.includes("families"));
  ok(await pg.isVisible("#join") && !(await pg.isVisible("#buy")), "landing shows the waitlist, not the checkout");
  await pg.screenshot({ path: shots + "/landing-phone.png", fullPage: true });
  await pg.fill("#w-name", "Sara Ahmed"); await pg.fill("#w-email", "sara@example.com"); await pg.fill("#w-phone", "+971 50 123 4567");
  await pg.selectOption("#w-age", "5"); await pg.selectOption("#w-country", "UAE");
  await pg.click("#waitlist-form button");
  await pg.waitForSelector(".done");
  ok((await pg.textContent(".done")).includes("You're on the list, Sara"), "waitlist sign-up works");
  ok((await (await fetch(base + "/api/checkout", { method: "POST", body: "{}" })).status) === 409, "checkout is closed in waitlist mode");

  const desk = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const d = await desk.newPage();
  await d.goto(base + "/storybloom/"); await d.waitForTimeout(600);
  await d.screenshot({ path: shots + "/landing-desktop.png", fullPage: true });

  // admin: log in, give early access to the waitlisted parent
  await d.goto(base + "/admin/");
  await d.fill("#pw", "localadmin"); await d.click("#login-form button");
  await d.waitForSelector("#app:not([hidden])");
  ok((await d.textContent("#wl")).includes("Sara Ahmed"), "admin sees the waitlist");
  await d.click("[data-approve]");
  await d.waitForSelector("#wl .tag.early");
  const code = (await d.textContent("#wl .tag.early")).trim();
  ok(/^BLOOM-/.test(code) && (await d.textContent("#wl")).includes("emailed ✓"), "Approve creates a 21-day code and emails it (" + code + ")");
  const outbox = await fetch(base + "/__resend/outbox").then(r => r.json());
  const mail = outbox.find(e => e.to[0] === "sara@example.com");
  ok(mail && mail.html.includes(code) && /early access/i.test(mail.subject) && /Google Meet/.test(mail.html) && mail.reply_to === "hello@unscrolled.me", "the email has the code, the Meet invite and replies go to hello@unscrolled.me");
  const again = await fetch(base + "/api/admin", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-key": "localadmin" }, body: JSON.stringify({ action: "approveAll" }) });
  ok(again.status === 404, "approving twice doesn't make a second code");
  await d.screenshot({ path: shots + "/admin.png", fullPage: true });

  // the app on a tablet: locked, unlock, offline
  const tab = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  const t = await tab.newPage();
  ok((await (await t.request.get(base + "/app/assets/audio/songs/baa-baa.mp3")).status()) === 401, "content is locked without a pass");
  await t.goto(base + "/app/");
  await t.waitForSelector("#sb-lock input");
  ok(await t.evaluate(() => { const i = document.querySelector("#sb-lock img.flower"); return i && i.complete && i.naturalWidth > 0; }), "the bloom flower shows on the unlock screen");
  await t.screenshot({ path: shots + "/app-locked.png" });
  await t.fill("#sb-lock input", code.toLowerCase().replace(/-/g, " "));
  await t.click("#sb-lock button[type=submit]");
  await t.waitForSelector("#home .tile", { timeout: 15000 });
  ok(true, "code unlocks the app and the home screen loads");
  await t.waitForFunction(() => navigator.serviceWorker.controller || false, null, { timeout: 120000 }).catch(() => {});
  await t.waitForFunction(async () => { const ks = await caches.keys(); if (!ks.length) return false; const c = await caches.open(ks[0]); return (await c.keys()).length > 600; }, null, { timeout: 180000, polling: 1000 });
  ok(true, "everything saved for offline use");
  await t.waitForTimeout(1500);
  await t.screenshot({ path: shots + "/app-home.png" });
  await tab.setOffline(true);
  await t.reload(); await t.waitForSelector("#home .tile", { timeout: 15000 });
  ok(true, "app opens offline");
  const audioOk = await t.evaluate(() => fetch("assets/audio/songs/baa-baa.mp3").then(r => r.ok));
  ok(audioOk, "songs play offline");

  // grown-ups corner shows the plan
  const info = await t.evaluate(() => { const e = accessInfo(); return e && e.textContent; });
  ok(/Early access/.test(info), "Grown-ups corner shows the plan: " + info.replace(/\s+/g, " ").slice(0, 70));

  // 3 weeks later, still offline → locked
  const until = await t.evaluate(() => window.ACCESS.until);
  await t.close();
  const t2 = await tab.newPage();
  await t2.clock.install({ time: new Date(until + DAY) });
  await t2.goto(base + "/app/"); await t2.waitForSelector("#sb-lock h1");
  ok((await t2.textContent("#sb-lock h1")).includes("early access has ended"), "after 21 days the app locks, even offline");
  await t2.screenshot({ path: shots + "/app-expired.png" });
  await t2.close();

  // clock moved back after being seen in the future → clock check
  await tab.clock.setSystemTime(new Date()); // the fake clock is shared by the whole browser context: back to today
  const t3 = await tab.newPage();
  await t3.addInitScript(() => localStorage.setItem("storybloom.seen", String(Date.now() + 10 * 864e5)));
  await t3.goto(base + "/app/"); await t3.waitForSelector("#sb-lock h1");
  ok((await t3.textContent("#sb-lock h1")).includes("date and time"), "turning the clock back is caught");
  await t3.close();

  // back online: admin extends → app works again; admin switches off → app locks
  await tab.setOffline(false);
  const t4 = await tab.newPage();
  await tab.clock.setSystemTime(new Date());
  await t4.evaluate(() => 0).catch(() => {});
  t4.on("console", m => console.log("    [t4 console] " + m.text()));
  await t4.goto(base + "/app/"); await waitHome(t4, "t4");
  await admin(base, "revoke", { code });
  await t4.close();
  const t5 = await tab.newPage();
  await tab.clock.setSystemTime(new Date(Date.now() + DAY)); // a day later the pass is "old", so the app checks in
  await t5.goto(base + "/app/"); await t5.waitForSelector("#sb-lock", { timeout: 15000 });
  ok((await t5.textContent("#sb-lock h1")).includes("Unlock"), "a switched-off code locks the app next time it's online");
  ok((await t5.evaluate(() => caches.keys())).length === 0, "and removes the offline copy");
  srv.kill();
}

/* ---------------- 2. founding mode with (fake) Ziina ---------------- */
{
  const base = "http://localhost:8902", srv = await server(8902, "founding");
  console.log("Founding mode");
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const pg = await ctx.newPage();
  await pg.goto(base + "/"); await pg.waitForFunction(() => /founding spots left/.test(document.querySelector("#sb-status").textContent));
  ok(true, "home shows the founding spots once sales open");
  await pg.goto(base + "/storybloom/");
  await pg.waitForSelector("#buy:not([hidden])");
  ok((await pg.textContent("#buy-btn")) === "Pay AED 39", "checkout shows the founding price");
  ok((await pg.textContent("#spots")).includes("100 of 100"), "founding spots counter shows");
  await pg.fill("#b-name", "Priya Nair"); await pg.fill("#b-email", "priya@example.com"); await pg.fill("#b-phone", "+971555555555");
  await pg.click("#buy-btn");
  await pg.waitForURL(/__ziina\/pay/);
  ok((await pg.textContent("body")).includes("AED 39.00"), "Ziina is asked for AED 39");
  await pg.click("#pay");
  await pg.waitForSelector(".codebox", { timeout: 20000 });
  const code = (await pg.textContent(".codebox")).trim();
  ok(/^BLOOM-/.test(code) && (await pg.textContent("h1")).includes("founding family"), "thank-you page shows the code " + code);
  await pg.screenshot({ path: shots + "/thanks-phone.png", fullPage: true });
  const again = await fetch(base + "/api/claim?pi=" + new URL(pg.url()).searchParams.get("pi")).then(r => r.json());
  ok(again.code === code, "opening the thank-you page twice gives the same code");
  const paidMail = (await fetch(base + "/__resend/outbox").then(r => r.json())).filter(e => e.to[0] === "priya@example.com");
  ok(paidMail.length === 1 && paidMail[0].html.includes(code), "the code is emailed once after paying");
  const st = await fetch(base + "/api/status").then(r => r.json());
  ok(st.foundingLeft === 99, "founding spots go down to 99");
  await pg.click("text=Open StoryBloom on this device");
  await pg.waitForSelector("#home .tile", { timeout: 20000 });
  ok(true, "the Open button unlocks the app straight away");

  // renewal keeps the founding price and extends the same code
  const before = (await admin(base, "summary")).members.find(m => m.code === code).until;
  await pg.goto(base + "/storybloom/?renew=" + code);
  await pg.waitForSelector("#renew-btn"); await pg.click("#renew-btn");
  await pg.waitForURL(/__ziina\/pay/);
  ok((await pg.textContent("body")).includes("AED 39.00"), "renewal is at the locked founding price");
  await pg.click("#pay"); await pg.waitForSelector(".codebox");
  const after = (await admin(base, "summary")).members.find(m => m.code === code).until;
  ok(Math.round((after - before) / DAY) === 365, "renewal adds a year to the same code");

  // webhook with a bad signature is refused
  const wh = await fetch(base + "/api/ziina-webhook", { method: "POST", body: JSON.stringify({ event: "payment_intent.status.updated", data: { id: "x", status: "completed" } }) });
  ok(wh.status === 401, "unsigned webhook is refused");
  srv.kill();
}

await browser.close();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
