/* StoryBloom access.
   - A family unlocks the app once with their code (BLOOM-XXXX-XXXX). The server returns a signed pass.
   - Offline, the pass is checked on the device itself: the signature (so it can't be edited),
     the paid-until date, a check-in date (online at least once every ~5 weeks) and clock tricks.
   - Whenever the device is online the pass is quietly refreshed, which picks up renewals and cancellations.
   - The app's content only loads after the pass checks out. */
(function () {
  const PASS = "storybloom.pass", DEV = "storybloom.device", SEEN = "storybloom.seen";
  const SHOP = "/";
  const DAY = 864e5, REFRESH_AFTER = 12 * 36e5, CLOCK_SLACK = 2 * DAY, WARN_DAYS = 14;
  const SCRIPTS = ["js/data-stories.js", "js/data-reading.js", "js/data-activities.js", "js/word-bank.js", "js/icons.js", "js/sfx.js",
    "js/core.js", "js/stories.js", "js/reading.js", "js/activities.js", "js/print.js", "js/data-songs.js", "js/songs.js", "js/home.js"];
  const PLAN = { founding: "Founding family", regular: "Yearly", early: "Early access", gift: "Gift" };

  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, String(v)); } catch (e) {} },
    del: k => { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const fmt = ms => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const renewUrl = code => SHOP + "?renew=" + encodeURIComponent(code);

  function device() {
    let d = ls.get(DEV);
    if (!d) { d = [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(16).padStart(2, "0")).join(""); ls.set(DEV, d); }
    return d;
  }

  /* ---- pass check (mirrors netlify/lib/pass.mjs) ---- */
  const unb64u = s => { s = s.replace(/-/g, "+").replace(/_/g, "/"); return Uint8Array.from(atob(s + "=".repeat((4 - s.length % 4) % 4)), c => c.charCodeAt(0)); };
  let keyP;
  async function readPass(token) {
    try {
      const jwk = window.SB_PASS_KEY;
      if (!token || !jwk || !crypto.subtle) return null;
      const [body, sig] = token.split(".");
      keyP = keyP || crypto.subtle.importKey("jwk", { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y }, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, await keyP, unb64u(sig), new TextEncoder().encode(body));
      return ok ? JSON.parse(new TextDecoder().decode(unb64u(body))) : null;
    } catch (e) { return null; }
  }

  async function status() {
    if (!window.SB_PASS_KEY) return { state: "setup" };
    const p = await readPass(ls.get(PASS));
    if (!p || p.d !== device()) return { state: "none" };
    const now = Date.now(), seen = Number(ls.get(SEEN)) || 0;
    if (now + CLOCK_SLACK < seen) return { state: "clock", p };
    if (now > seen) ls.set(SEEN, now);
    if (now >= p.u) return { state: "expired", p };
    if (now >= p.k) return { state: "checkin", p };
    return { state: "ok", p };
  }

  async function api(path, data) {
    const r = await fetch("/api/" + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "same-origin", cache: "no-store" });
    let j = {}; try { j = await r.json(); } catch (e) {}
    return j;
  }
  function accept(j) { if (j.pass) ls.set(PASS, j.pass); if (j.serverTime) ls.set(SEEN, j.serverTime); }

  async function wipe() {
    try { for (const k of await caches.keys()) if (k.startsWith("storybloom-")) await caches.delete(k); } catch (e) {}
    try { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); } catch (e) {}
  }

  async function refresh() {
    const token = ls.get(PASS);
    if (!token) return null;
    const j = await api("refresh", { pass: token, device: device() }); // throws when offline
    if (j.status === "ok") accept(j);
    else if (j.serverTime) ls.set(SEEN, j.serverTime);
    if (j.status === "revoked") { ls.del(PASS); await wipe(); }
    if (j.status === "invalid" || j.status === "device_removed") ls.del(PASS);
    return j;
  }

  async function redeem(code) {
    if (!navigator.onLine) return { error: "You're offline. Connect to the internet once to unlock StoryBloom." };
    try {
      const j = await api("redeem", { code, device: device() });
      if (j.status === "ok") { accept(j); return { ok: true }; }
      return j;
    } catch (e) { return { error: "Couldn't reach StoryBloom. Check the internet and try again." }; }
  }

  /* ---- starting the app ---- */
  function loadScripts() {
    return new Promise((res, rej) => {
      let left = SCRIPTS.length;
      SCRIPTS.forEach(src => {
        const s = document.createElement("script");
        s.src = src; s.async = false;
        s.onload = () => { if (--left === 0) res(); };
        s.onerror = () => rej(src);
        document.body.append(s);
      });
    });
  }

  let started = false;
  async function start(p) {
    if (started) return; started = true;
    window.ACCESS = { plan: p.p, code: p.c, until: p.u, daysLeft: Math.ceil((p.u - Date.now()) / DAY) };
    try { await loadScripts(); }
    catch (e) {
      // the content didn't load (usually a missing cookie while online): refresh once and reload
      if (navigator.onLine && !sessionStorage.getItem("sb-retry")) {
        sessionStorage.setItem("sb-retry", "1");
        try { await refresh(); } catch (err) {}
        return location.reload();
      }
      started = false;
      return lock({ state: "checkin", p });
    }
    sessionStorage.removeItem("sb-retry");
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      navigator.serviceWorker.register("sw.js").then(() => {
        navigator.serviceWorker.addEventListener("message", e => { if (e.data === "cached" && window.toast) toast("✅ Ready to use offline!", 3500); });
      }).catch(() => {});
    }
    if (window.ACCESS.daysLeft <= WARN_DAYS) banner(p);
    setInterval(async () => { const st = await status(); if (st.state !== "ok") lock(st); }, 10 * 60 * 1000);
  }

  // Shown inside the Grown-ups corner (see home.js).
  window.accessInfo = function () {
    const a = window.ACCESS; if (!a || !window.h) return null;
    return h("div", { class: "form-row", style: { flexDirection: "column", alignItems: "flex-start", gap: "4px" } },
      h("b", {}, "StoryBloom plan: " + (PLAN[a.plan] || "Active")),
      h("span", {}, "Active until " + fmt(a.until) + " · Code " + a.code),
      h("a", { href: renewUrl(a.code), target: "_blank", rel: "noopener", style: { color: "inherit" } }, "Renew or extend"));
  };

  /* ---- screens ---- */
  function css() {
    if (document.getElementById("sb-lock-css")) return;
    const s = document.createElement("style"); s.id = "sb-lock-css";
    s.textContent = `
#sb-lock{position:fixed;inset:0;z-index:1000;background:#fbf6ec;display:grid;place-items:center;padding:24px;font-family:Fredoka,Andika,system-ui,sans-serif;color:#2f2a3b;touch-action:manipulation;user-select:text;-webkit-user-select:text;overflow:auto}
#sb-lock .card{width:min(460px,100%);background:#fff;border:3px solid #2f2a3b;border-radius:28px 34px 30px 32px;box-shadow:6px 8px 0 #2f2a3b;padding:30px 26px;text-align:center}
#sb-lock .flower{font-size:56px;line-height:1}
#sb-lock h1{font-size:30px;margin:10px 0 6px}
#sb-lock p{font-family:Andika,system-ui,sans-serif;font-size:18px;line-height:1.45;margin:8px 0;color:#5d5670}
#sb-lock input{width:100%;font:600 22px Fredoka,system-ui,sans-serif;letter-spacing:2px;text-transform:uppercase;text-align:center;padding:14px;border:3px solid #2f2a3b;border-radius:16px;margin:14px 0 10px;background:#fffdf7;color:#2f2a3b}
#sb-lock button,#sb-lock .btn{display:block;width:100%;font:600 21px Fredoka,system-ui,sans-serif;padding:14px;border-radius:22px;border:3px solid #2f2a3b;background:#f7cf4a;color:#2f2a3b;cursor:pointer;text-decoration:none;margin-top:10px;box-shadow:3px 4px 0 #2f2a3b}
#sb-lock .ghost{background:#fff}
#sb-lock .msg{min-height:24px;color:#c4473a;font-size:16px}
#sb-lock .small{font-size:15px;margin-top:16px}
#sb-lock .small a{color:#2f2a3b}
#sb-banner{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:900;background:#fff;border:2px solid #2f2a3b;border-radius:30px;padding:8px 16px;font:500 16px Fredoka,system-ui,sans-serif;color:#2f2a3b;box-shadow:2px 3px 0 #2f2a3b;white-space:nowrap}
#sb-banner a{color:#2f2a3b;font-weight:700}`;
    document.head.append(s);
  }
  const el = (tag, attrs, ...kids) => { const e = document.createElement(tag); for (const k in attrs || {}) { if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]); else e.setAttribute(k, attrs[k]); } kids.forEach(c => c != null && e.append(c)); return e; };

  function lock(st) {
    css();
    const sp = document.getElementById("splash"); if (sp) sp.remove();
    let box = document.getElementById("sb-lock");
    if (box) box.remove();
    box = el("div", { id: "sb-lock" });
    const card = el("div", { class: "card" });
    const msg = el("p", { class: "msg", role: "alert" });
    const code = st.p && st.p.c;

    const codeForm = () => {
      const input = el("input", { placeholder: "BLOOM-XXXX-XXXX", autocomplete: "off", autocapitalize: "characters", spellcheck: "false", "aria-label": "Your StoryBloom code" });
      const go = el("button", { type: "submit" }, "Unlock");
      const form = el("form", {}, input, msg, go);
      form.addEventListener("submit", async e => {
        e.preventDefault();
        go.disabled = true; go.textContent = "Checking…"; msg.textContent = "";
        const r = await redeem(input.value);
        if (r.ok) { box.remove(); return boot(); }
        go.disabled = false; go.textContent = "Unlock";
        msg.textContent = r.error || "That code didn't work. Please check it.";
      });
      return form;
    };
    const checkAgain = label => el("button", { class: "ghost", onclick: async e => {
      const b = e.currentTarget; b.textContent = "Checking…"; msg.textContent = "";
      if (!navigator.onLine) { b.textContent = label; msg.textContent = "Still offline. Connect to Wi-Fi or mobile data first."; return; }
      try { await refresh(); } catch (err) {}
      const s = await status();
      if (s.state === "ok") { box.remove(); return start(s.p); }
      b.textContent = label; lock(s);
    } }, label);
    const shop = el("p", { class: "small" }, "No code yet? ", el("a", { href: SHOP + "#pricing", target: "_blank", rel: "noopener" }, "Get StoryBloom at unscrolled.me"));

    card.append(el("div", { class: "flower" }, "🌼"));
    if (st.state === "expired" && st.p.p === "early") {
      card.append(el("h1", {}, "Your early access has ended"),
        el("p", {}, "Thank you for trying StoryBloom with us! Watch your WhatsApp for the parents' call and founding-family spots. Stars and stickers are saved on this device."),
        el("a", { class: "btn", href: renewUrl(code), target: "_blank", rel: "noopener" }, "Keep StoryBloom"),
        msg, checkAgain("I've joined, check again"));
    } else if (st.state === "expired") {
      card.append(el("h1", {}, "Your StoryBloom year has ended"),
        el("p", {}, "Renew to keep the stories, songs and activities going. Stars and stickers are saved on this device."),
        el("a", { class: "btn", href: renewUrl(code), target: "_blank", rel: "noopener" }, "Renew StoryBloom"),
        msg, checkAgain("I've renewed, check again"));
    } else if (st.state === "checkin") {
      card.append(el("h1", {}, "Time for a quick check-in"),
        el("p", {}, "StoryBloom needs the internet once every few weeks to keep working offline. Connect this device, then tap below."),
        msg, checkAgain("Check again"));
    } else if (st.state === "clock") {
      card.append(el("h1", {}, "Check the date and time"),
        el("p", {}, "This device's clock looks wrong. Set the correct date and time, connect to the internet, then tap below."),
        msg, checkAgain("Check again"));
    } else if (st.state === "setup") {
      card.append(el("h1", {}, "StoryBloom is getting ready"), el("p", {}, "Please try again in a little while."));
    } else {
      card.append(el("h1", {}, "Unlock StoryBloom"),
        el("p", {}, "Enter the code from your email or WhatsApp. You only need to do this once on each device."),
        codeForm(), shop);
    }
    if (st.state === "expired" || st.state === "checkin") {
      const other = el("p", { class: "small" }, el("a", { href: "#", onclick: e => { e.preventDefault(); ls.del(PASS); lock({ state: "none" }); } }, "Use a different code"));
      card.append(other);
    }
    box.append(card);
    document.body.append(box);
  }

  function banner(p) {
    css();
    const days = Math.max(0, Math.ceil((p.u - Date.now()) / DAY));
    const early = p.p === "early";
    const b = el("div", { id: "sb-banner" }, (early ? "Early access ends in " : "StoryBloom ends in ") + days + (days === 1 ? " day · " : " days · "),
      el("a", { href: renewUrl(p.c), target: "_blank", rel: "noopener" }, early ? "Keep it" : "Renew"));
    document.body.append(b);
    setTimeout(() => b.remove(), 12000);
  }

  async function boot() {
    const qs = new URLSearchParams(location.search);
    const urlCode = qs.get("code");
    if (urlCode) {
      history.replaceState(null, "", location.pathname);
      const now = await status();
      if (now.state !== "ok" || now.p.c !== urlCode.toUpperCase()) {
        const r = await redeem(urlCode);
        if (!r.ok) { lock({ state: "none" }); const m = document.querySelector("#sb-lock .msg"); if (m) m.textContent = r.error || "That code didn't work."; return; }
      }
    }
    let st = await status();
    const stale = st.p && Date.now() - st.p.i > REFRESH_AFTER;
    if (navigator.onLine && st.p && (st.state !== "ok" || stale)) {
      try { await refresh(); st = await status(); } catch (e) {}
    }
    if (st.state === "ok") start(st.p); else lock(st);
  }

  window.addEventListener("online", () => { if (started) refresh().catch(() => {}); });
  boot();
})();
