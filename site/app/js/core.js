/* StoryBloom core: fixed stage, no-zoom, window manager, narration, progress. */
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (k === "class") el.className = v;
      else if (k === "style" && typeof v === "object") { for (const sk in v) { if (v[sk] == null) continue; if (sk.startsWith("--")) el.style.setProperty(sk, v[sk]); else el.style[sk] = v[sk]; } }
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (k === "html") el.innerHTML = v;
      else if (v !== false && v != null) el.setAttribute(k, v);
    }
    kids.flat().forEach(c => c != null && el.append(c.nodeType ? c : document.createTextNode(c)));
    return el;
  };
  window.$ = $; window.h = h;
  window.rand = a => a[Math.floor(Math.random() * a.length)];
  window.shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  window.wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------------- fixed stage scaling ---------------- */
  const stage = $("#stage");
  // Read the real visible size. Right after launch (home-screen icon, QR scan, background tab)
  // some browsers briefly report a wrong size, so take the best of the available measurements.
  function screenSize() {
    const de = document.documentElement, vv = window.visualViewport;
    const W = Math.max(window.innerWidth || 0, de.clientWidth || 0) || (vv && vv.width) || 1280;
    const H = Math.max(window.innerHeight || 0, de.clientHeight || 0) || (vv && vv.height) || 800;
    return [W, H];
  }
  let lastFit = "";
  function fit() {
    const [W, H] = screenSize();
    const key = W + "x" + H + (stage.classList.contains("is-night") ? "n" : "");
    if (key === lastFit && arguments[0] !== true) return;
    lastFit = key;
    const portrait = H > W * 1.15;
    stage.classList.toggle("portrait", portrait);
    const w = portrait ? 800 : 1280, hh = portrait ? 1280 : 800;
    const s = Math.min(W / w, H / hh);
    stage.style.transform = `scale(${s})`;
    stage.style.left = (W - w * s) / 2 + "px";
    stage.style.top = (H - hh * s) / 2 + "px";
    document.body.style.background = stage.classList.contains("is-night") ? "#141938" : "#e9dcc4";
    window.dispatchEvent(new Event("stagefit"));
  }
  const refit = () => fit(true);
  window.addEventListener("resize", fit);
  window.addEventListener("orientationchange", () => { setTimeout(fit, 200); setTimeout(fit, 700); });
  window.addEventListener("pageshow", refit);
  window.addEventListener("load", refit);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) fit(); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(() => fit()).observe(document.documentElement);
  // keep checking for a moment after launch, while the screen size settles
  [50, 250, 600, 1200, 2500].forEach(ms => setTimeout(fit, ms));
  // and a slow safety net in case a size change is ever missed
  setInterval(fit, 1500);
  fit(true); window.fitStage = refit;

  /* ---------------- full screen ---------------- */
  // In a normal browser tab, the first tap switches StoryBloom to full screen (no address bar),
  // and taps after the child leaves full screen bring it back. Installed to the home screen,
  // it already opens full screen.
  const standalone = () => (window.matchMedia && matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches) || navigator.standalone;
  const isFull = () => document.fullscreenElement || document.webkitFullscreenElement;
  const goFull = () => {
    if (standalone() || isFull()) return;
    const el = document.documentElement, req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (!req) return;
    try { const p = req.call(el, { navigationUI: "hide" }); if (p && p.catch) p.catch(() => {}); } catch (e) {}
  };
  document.addEventListener("click", goFull, true);
  ["fullscreenchange", "webkitfullscreenchange"].forEach(e => document.addEventListener(e, () => setTimeout(refit, 120)));

  /* ---------------- block zooming & scrolling ---------------- */
  ["gesturestart", "gesturechange", "gestureend"].forEach(e => document.addEventListener(e, ev => ev.preventDefault(), { passive: false }));
  document.addEventListener("touchmove", e => { if (e.touches.length > 1 || !e.target.closest("canvas")) e.preventDefault(); }, { passive: false });
  document.addEventListener("wheel", e => e.preventDefault(), { passive: false });
  document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) e.preventDefault(); });
  let lastTouch = 0;
  document.addEventListener("touchend", e => { const n = Date.now(); if (n - lastTouch < 300 && !e.target.closest("input")) e.preventDefault(); lastTouch = n; }, { passive: false });
  document.addEventListener("dblclick", e => e.preventDefault());
  document.addEventListener("contextmenu", e => e.preventDefault());

  /* ---------------- saved progress ---------------- */
  const KEY = "storybloom.v1";
  const defaults = { stars: 0, stickers: [], done: {}, settings: { sfx: true, amb: true, music: true, autoNight: true, sleepMin: 0 }, name: "" };
  let S;
  try { S = Object.assign({}, defaults, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { S = JSON.parse(JSON.stringify(defaults)); }
  S.settings = Object.assign({}, defaults.settings, S.settings || {});
  window.APP = S; window.APPSET = S.settings;
  window.save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

  const STICKERS = ["unicorn", "dolphin", "butterfly", "rainbow", "rocket", "owl", "lion", "camel", "fox", "octopus", "star", "watermelon", "sunflower", "balloon", "cupcake", "icecream", "palm", "trophy", "kangaroo", "zebra", "tiger", "rabbit", "pig", "cat", "dog", "fish", "kite", "apple", "queen", "dhow", "lantern", "sun", "moon", "hen", "goat", "bus"];
  window.STICKERS = STICKERS;
  window.award = function (key, stars = 1) {
    S.stars += stars; let newSticker = null;
    if (key && !S.done[key]) { S.done[key] = 1; newSticker = STICKERS[S.stickers.length % STICKERS.length]; S.stickers.push(newSticker); }
    save(); updateStarCount(); return newSticker;
  };
  window.updateStarCount = () => document.querySelectorAll(".star-count").forEach(e => { e.innerHTML = ""; e.append(icon("star", 22), " " + S.stars); e.setAttribute("aria-label", "Sticker book: " + S.stars + " stars"); });

  /* ---------------- audio: clips, words, narration ---------------- */
  const AUD = "assets/audio/";
  let current = null, token = 0;
  // One shared player for every voice clip. Browsers on older tablets and iPads may refuse to
  // start a brand-new player from a timer (auto-turn), so this one is unlocked by the first tap
  // and reused for everything after that.
  const VOICE = new Audio(); VOICE.preload = "auto";
  const SILENT = "data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
  let unlocked = false;
  const unlockVoice = () => {
    if (unlocked) return; unlocked = true;
    if (!current) { VOICE.src = SILENT; const p = VOICE.play(); if (p && p.catch) p.catch(() => { unlocked = false; }); }
  };
  ["pointerdown", "touchstart", "mousedown", "keydown"].forEach(e => document.addEventListener(e, unlockVoice, true));
  window.stopAudio = function () {
    token++;
    if (current) { current.pause(); current.onended = current.onerror = current.ontimeupdate = null; current = null; }
    if (window.stopSong && !window.__keepSong) window.stopSong();
    if (window.speechSynthesis) speechSynthesis.cancel();
    cancelAnimationFrame(rafId); clearTimeout(watchdog);
  };
  let watchdog = 0;
  // Wait until the screen a voice belongs to is actually showing: its pictures loaded, the
  // reading font ready and the opening animation finished. Slow tablets need this, or the
  // voice says a letter before the child can see it.
  const celebrating = () => !!stage.querySelector(".celebrate");
  const noCelebration = () => new Promise(r => { const t0 = Date.now(); (function chk() { if (!celebrating() || Date.now() - t0 > 20000) r(); else setTimeout(chk, 150); })(); });
  window.screenReady = function (opts) {
    if (!(opts && opts.over) && celebrating()) return noCelebration().then(() => wait(300)).then(() => screenReady(opts));
    const wins = stage.querySelectorAll(".win:not(.closing)"), w = wins[wins.length - 1] || stage;
    const imgs = Array.prototype.filter.call(w.querySelectorAll("img"), i => !i.complete);
    const loads = imgs.map(i => new Promise(r => { i.addEventListener("load", r, { once: true }); i.addEventListener("error", r, { once: true }); }));
    if (document.fonts && document.fonts.ready) loads.push(document.fonts.ready);
    const opened = w.__openedAt || 0, anim = Math.max(0, 380 - (Date.now() - opened));
    return Promise.race([Promise.all(loads), wait(3500)])
      .then(() => wait(anim))
      .then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  };
  // Play a file on the shared player. Calls onReady(audio) once it's playing, or onFail().
  function startVoice(src, my, onReady, onFail, opts) {
    screenReady(opts).then(() => {
      if (my !== token) return;
      const a = VOICE; current = a;
      a.onended = a.onerror = a.ontimeupdate = null;
      a.pause(); a.src = src; a.currentTime = 0;
      let failed = false; const fail = () => { if (failed || my !== token) return; failed = true; if (current === a) current = null; onFail(); };
      a.onerror = fail;
      const p = a.play();
      if (p && p.then) p.then(() => { if (my === token) onReady(a); }).catch(err => {
        if (my !== token) return;
        if (err && err.name === "NotAllowedError") { // not allowed to play yet: play on the next tap
          const go = () => { document.removeEventListener("pointerdown", go, true); if (my === token) a.play().then(() => onReady(a)).catch(fail); };
          document.addEventListener("pointerdown", go, true);
        } else fail();
      });
      else onReady(a);
    });
  }
  function voice() {
    const vs = speechSynthesis.getVoices();
    return vs.find(v => /en-GB/i.test(v.lang) && /female|libby|sonia|serena|kate|martha/i.test(v.name)) || vs.find(v => /^en/i.test(v.lang)) || null;
  }
  function tts(text, rate = 0.85) {
    return new Promise(res => {
      if (!window.speechSynthesis) return res();
      const u = new SpeechSynthesisUtterance(text); u.rate = rate; u.pitch = 1.05; const v = voice(); if (v) u.voice = v;
      let done = false; const fin = () => { if (!done) { done = true; clearTimeout(t); res(); } };
      const t = setTimeout(fin, 1500 + String(text).split(/\s+/).length * 700);
      u.onend = u.onerror = fin; speechSynthesis.speak(u);
    });
  }
  window.tts = tts;
  // Play an audio file; resolves when it ends. Falls back to device speech if the file is missing.
  window.playClip = function (src, fallbackText, opts) {
    stopAudio(); const my = token;
    return new Promise(res => {
      let done = false; const fin = () => { if (!done) { done = true; clearTimeout(watchdog); res(); } };
      startVoice(src, my, a => {
        a.onended = fin;
        // safety net: never wait more than the clip's length + 2 s
        const guard = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { if (my === token) fin(); }, ((a.duration && isFinite(a.duration) ? a.duration : 8) + 2) * 1000); };
        guard(); a.ondurationchange = guard;
      }, () => { fallbackText && my === token ? tts(fallbackText).then(fin) : fin(); }, opts);
    });
  };
  const WORDSET = new Set(window.WORD_BANK || []);
  window.sayWord = w => {
    const k = w.toLowerCase().replace(/[^a-z'-]/g, "");
    return WORDSET.has(k) ? playClip(AUD + "words/" + k + ".mp3", w) : (stopAudio(), tts(w, 0.75));
  };
  window.saySound = l => playClip(AUD + "phonemes/" + l + ".mp3", l);
  window.sayPrompt = (k, opts) => playClip(AUD + "ui/" + k + ".mp3", (window.PROMPTS || {})[k], opts);
  window.sayLetter = async l => {
    const L = LETTERS.find(x => x.l === l); await saySound(l); await wait(250); await saySound(l); await wait(250); await sayWord(L.word);
  };

  /* Narrate a clip while highlighting words. spans = word elements in reading order.
     Timing is estimated from word length + punctuation, scaled to the clip's real duration. */
  let rafId = 0;
  window.narrate = function (src, spans, text, { onWord } = {}) {
    stopAudio();
    const weights = spans.map(s => {
      const t = s.textContent; let w = Math.max(2, t.replace(/[^a-zA-Z]/g, "").length) + 2.2;
      if (/[,;:]$/.test(t) || /[,;:]["”]?$/.test(t)) w += 3; if (/[.!?]["”]?$/.test(t)) w += 6; return w;
    });
    const total = weights.reduce((a, b) => a + b, 0);
    let acc = 0; const starts = weights.map(w => { const s = acc / total; acc += w; return s; });
    const light = i => spans.forEach((s, j) => { s.classList.toggle("on", j === i); s.classList.toggle("done", j < i); });
    stopAudio(); const my = token;
    return new Promise(res => {
      let last = -1, ended = false;
      const finish = () => { if (ended) return; ended = true; cancelAnimationFrame(rafId); clearInterval(stallT); spans.forEach(s => s.classList.remove("on")); res(); };
      let stallT = 0;
      const speak = () => { // device speech if the recording can't play
        if (my !== token) return;
        if (!window.speechSynthesis) return finish();
        const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; const v = voice(); if (v) u.voice = v;
        const offs = []; let pos = 0; spans.forEach(s => { const i = text.indexOf(s.textContent, pos); offs.push(i < 0 ? pos : i); pos = (i < 0 ? pos : i) + s.textContent.length; });
        u.onboundary = e => { let i = offs.findIndex((o, k) => e.charIndex >= o && (k === offs.length - 1 || e.charIndex < offs[k + 1])); if (i >= 0 && i !== last) { last = i; light(i); onWord && onWord(i); } };
        const t = setTimeout(finish, 2000 + spans.length * 650);
        u.onend = u.onerror = () => { clearTimeout(t); finish(); }; speechSynthesis.speak(u);
      };
      startVoice(src, my, a => {
        const tick = () => {
          if (my !== token) return;
          if (a.duration && isFinite(a.duration)) {
            const lead = 0.12, usable = Math.max(0.5, a.duration - 0.35);
            const p = Math.max(0, (a.currentTime - lead) / usable);
            const i = starts.findIndex((s, k) => p >= s && (k === starts.length - 1 || p < starts[k + 1]));
            if (i !== last && i >= 0) { last = i; light(i); onWord && onWord(i); }
          }
          rafId = requestAnimationFrame(tick);
        };
        a.onended = () => { if (my === token) finish(); };
        rafId = requestAnimationFrame(tick);
        // stall guard: if playback stops moving for 6 s while it should be playing, move on
        let lastT = -1, still = 0;
        stallT = setInterval(() => {
          if (my !== token) return clearInterval(stallT);
          if (window.__storyPaused) { still = 0; return; }
          if (a.currentTime === lastT) { if (++still >= 6) { finish(); } } else { still = 0; lastT = a.currentTime; }
          if (a.ended) finish();
        }, 1000);
      }, speak);
    });
  };
  window.pauseAudio = () => { window.__storyPaused = true; if (current) current.pause(); };
  window.resumeAudio = () => { window.__storyPaused = false; if (current) { const p = current.play(); if (p && p.catch) p.catch(() => {}); } };

  // Split text into tappable word spans.
  window.wordSpans = function (text, cls = "w") {
    return text.split(/\s+/).filter(Boolean).map(t => h("span", { class: cls }, t));
  };
  window.layWords = function (container, text) {
    container.innerHTML = ""; const spans = wordSpans(text);
    spans.forEach((s, i) => { container.append(s, " "); s.addEventListener("click", ev => { ev.stopPropagation(); SFX.play("tap"); s.classList.add("tap"); setTimeout(() => s.classList.remove("tap"), 600); sayWord(s.textContent); }); });
    return spans;
  };

  /* ---------------- decorative helpers ---------------- */
  const CUT_FONTS = [["Abril", 400], ["Bungee", 400], ["Special", 400], ["Fredoka", 700], ["Caveat", 700], ["Andika", 700]];
  const CUT_BG = ["#fff", "#f7cf4a", "#ef6f61", "#9ccbf0", "#7cc28a", "#f29bb8", "#2f2a3b", "#fbe3c0", "#c6b3ef", "#f6a04d"];
  let seed = 7; const srnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  // Clean, readable heading: one bold face on a white paper strip with a bit of tape.
  const LABEL_TAPE = ["#f7cf4a", "#9ccbf0", "#f29bb8", "#a8dab5", "#c6b3ef"];
  let labelN = 0;
  window.cutout = function (text, size) {
    const fs = size || 34, el = h("div", { class: "label-title", style: { fontSize: fs + "px", transform: `rotate(${labelN % 2 ? 0.8 : -0.8}deg)` } }, text);
    el.append(h("i", { class: "label-tape", style: { background: LABEL_TAPE[labelN++ % LABEL_TAPE.length] } }));
    return el;
  };
  // The playful magazine cut-out letters, used only for the StoryBloom logo.
  window.cutoutFancy = function (text, size) {
    const box = h("div", { class: "cutout" });
    text.split(" ").forEach((word, wi) => {
      const wb = h("div", { class: "cword" }); box.append(wb);
      [...word].forEach(ch => {
      const [f, wgt] = CUT_FONTS[Math.floor(srnd() * CUT_FONTS.length)], bg = CUT_BG[Math.floor(srnd() * CUT_BG.length)];
      const dark = bg === "#2f2a3b" || bg === "#ef6f61";
      wb.append(h("span", { style: { fontFamily: f, fontWeight: wgt, background: bg, color: dark ? "#fff" : "#2f2a3b", transform: `rotate(${(srnd() * 10 - 5).toFixed(1)}deg) translateY(${(srnd() * 6 - 3).toFixed(0)}px)`, fontSize: size ? size + "px" : null } }, ch));
      });
    });
    return box;
  };
  window.blobs = function (parent, colors, n = 5) {
    for (let i = 0; i < n; i++) {
      const s = 160 + Math.random() * 320;
      parent.prepend(h("div", { class: "blob", style: { width: s + "px", height: s * (0.7 + Math.random() * .5) + "px", left: Math.random() * 100 - 10 + "%", top: Math.random() * 100 - 10 + "%", background: colors[i % colors.length] } }));
    }
  };
  // jagged torn-paper clip path
  window.tornPath = function (amp = 1.4, steps = 22) {
    const pts = []; const j = () => (Math.random() * amp).toFixed(2);
    for (let i = 0; i <= steps; i++) pts.push(`${(i / steps * 100).toFixed(1)}% ${j()}%`);
    for (let i = 0; i <= steps; i++) pts.push(`${100 - j()}% ${(i / steps * 100).toFixed(1)}%`);
    for (let i = steps; i >= 0; i--) pts.push(`${(i / steps * 100).toFixed(1)}% ${100 - j()}%`);
    for (let i = steps; i >= 0; i--) pts.push(`${j()}% ${(i / steps * 100).toFixed(1)}%`);
    return `polygon(${pts.join(",")})`;
  };
  // hand-drawn pencil scribble svg
  window.scribble = function (color = "#2f2a3b", kind = "under") {
    const ns = "http://www.w3.org/2000/svg", svg = document.createElementNS(ns, "svg"); svg.setAttribute("viewBox", "0 0 100 100"); svg.setAttribute("preserveAspectRatio", "none");
    const p = document.createElementNS(ns, "path");
    let d = "";
    if (kind === "under") { d = "M5 92 "; for (let x = 10; x <= 95; x += 6) d += `L${x} ${90 + Math.random() * 4} `; }
    else { for (let i = 0; i < 3; i++) { d += `M${3 + Math.random() * 2} ${3 + Math.random() * 2} L${97 - Math.random() * 2} ${2 + Math.random() * 3} L${98 - Math.random() * 2} ${97 - Math.random() * 2} L${2 + Math.random() * 3} ${98 - Math.random() * 2} Z `; } }
    p.setAttribute("d", d); p.setAttribute("fill", "none"); p.setAttribute("stroke", color); p.setAttribute("stroke-width", kind === "under" ? 1.2 : 0.4);
    p.setAttribute("vector-effect", "non-scaling-stroke"); p.style.strokeWidth = kind === "under" ? "4px" : "2px"; p.setAttribute("stroke-linecap", "round"); p.setAttribute("filter", "url(#pencil)");
    svg.append(p); svg.classList.add("scribble"); return svg;
  };

  /* ---------------- window manager: every activity opens in a new window ---------------- */
  const stack = [];
  window.openWin = function ({ title, bg, night = false, build, onClose, titleColor }) {
    SFX.play("open");
    const win = h("div", { class: "win grain" + (night ? " night" : "") }); win.__openedAt = Date.now();
    if (bg) win.style.background = bg;
    const back = h("button", { class: "back-btn", "aria-label": "Back" }, icon("back", 34));
    // the same StoryBloom logo as the home page, small, on every page
    const homeLogo = document.querySelector("#home .logo");
    const logo = homeLogo ? homeLogo.cloneNode(true) : h("div", { class: "logo" }, cutoutFancy("StoryBloom", 28));
    logo.classList.add("mini"); logo.setAttribute("aria-hidden", "true");
    const bar = h("div", { class: "win-bar" }, back, logo, title ? cutout(title, 38) : null);
    const body = h("div", { class: "win-body" });
    win.append(bar, body);
    stage.append(win);
    const api = {
      el: win, body, bar,
      close() {
        if (api.closed) return; api.closed = true; stopAudio(); SFX.play("close");
        onClose && onClose(); api.cleanup.forEach(f => f());
        win.classList.add("closing"); setTimeout(() => win.remove(), 250);
        const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
        if (night) stage.classList.toggle("is-night", stack.some(w => w.night)); fit();
      },
      cleanup: [], night
    };
    back.addEventListener("click", () => { history.back(); });
    stack.push(api); history.pushState({ win: stack.length }, "");
    if (night) { stage.classList.add("is-night"); fit(); }
    build && build(body, api);
    return api;
  };
  window.addEventListener("popstate", () => { const w = stack[stack.length - 1]; if (w) w.close(); });

  /* ---------------- feedback ---------------- */
  window.toast = function (msg, ms = 2200) { const t = h("div", { class: "toast" }, msg); stage.append(t); setTimeout(() => t.remove(), ms); };
  window.celebrate = function (key, { stars = 1, msg = "Well done!", autoClose = 0 } = {}) {
    const st = award(key, stars);
    SFX.play("star");
    const c = h("div", { class: "celebrate" });
    const colors = ["#ef6f61", "#f7cf4a", "#7cc28a", "#5b9bd5", "#f29bb8", "#9b7fd1"];
    for (let i = 0; i < 40; i++) c.append(h("i", { class: "confetti", style: { left: Math.random() * 100 + "%", background: rand(colors), animationDuration: 1.5 + Math.random() * 2 + "s", animationDelay: Math.random() * .6 + "s" } }));
    c.append(h("div", { class: "box" },
      h("div", { class: "sticker" }, pic(st || "star", 180)),
      cutout(msg, 56),
      h("div", { class: "hand", style: { fontSize: "34px", marginTop: "10px" } }, st ? "New sticker for your book!" : `+${stars} star${stars > 1 ? "s" : ""}`),
      h("button", { class: "pbtn green", style: { marginTop: "26px" }, onclick: () => c.remove() }, "Yay!")));
    stage.append(c);
    sayPrompt(st ? "sticker" : rand(["great", "wow"]), { over: true });
    const btn = c.querySelector(".pbtn");
    if (autoClose) setTimeout(() => { if (c.isConnected) btn.click(); }, autoClose);
    return new Promise(r => btn.addEventListener("click", r));
  };

  // Simple pager for fixed screens: shows `per` items at a time with arrows.
  window.pager = function (container, items, per, render, { cols = 4, gap = 22 } = {}) {
    let page = 0; const pages = Math.max(1, Math.ceil(items.length / per));
    const rows = Math.ceil(Math.min(per, items.length) / cols);
    const grid = h("div", { class: "grid", style: { gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)`, alignContent: "stretch", gap: gap + "px", top: "6px", bottom: pages > 1 ? "100px" : "30px" } });
    const dots = h("div", { style: { display: "flex", gap: "10px" } });
    const prev = h("button", { class: "arrow", "aria-label": "Previous page" }, icon("left", 34)), next = h("button", { class: "arrow", "aria-label": "Next page" }, icon("right", 34));
    const bar = h("div", { class: "pager" }, prev, dots, next);
    const draw = () => {
      grid.innerHTML = ""; items.slice(page * per, page * per + per).forEach((it, i) => grid.append(render(it, page * per + i)));
      dots.innerHTML = ""; for (let i = 0; i < pages; i++) dots.append(h("i", { class: "dot" + (i === page ? " on" : "") }));
      prev.disabled = page === 0; next.disabled = page === pages - 1;
    };
    prev.onclick = () => { if (page > 0) { page--; SFX.play("tap"); draw(); } };
    next.onclick = () => { if (page < pages - 1) { page++; SFX.play("tap"); draw(); } };
    container.append(grid); if (pages > 1) container.append(bar);
    draw(); return { redraw: draw };
  };

  // unlock audio on first touch (mobile autoplay rules)
  const unlock = () => { SFX.unlock(); if (window.speechSynthesis) speechSynthesis.getVoices(); document.removeEventListener("pointerdown", unlock); };
  document.addEventListener("pointerdown", unlock);
})();
