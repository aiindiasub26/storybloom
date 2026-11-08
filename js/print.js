/* Print Shop: printable worksheets generated on the device + colouring pages. */
(function () {
  const COLOURING = [
    { id: "pip-star", t: "Pip the Star" }, { id: "owl", t: "Little Owl" }, { id: "pigs", t: "Three Pigs" }, { id: "lion-mouse", t: "Lion & Mouse" },
    { id: "turtle", t: "Tala the Turtle" }, { id: "camel", t: "Jamila the Camel" }, { id: "falcon", t: "Faris the Falcon" }, { id: "tortoise-hare", t: "Tortoise & Hare" }
  ];
  const PIC = {}; CVC.forEach(c => PIC[c.w] = c.pic);

  /* ---------- printing engine ---------- */
  window.printSheets = function (sheets) {
    const root = $("#print-root"); root.innerHTML = sheets.join("");
    const imgs = [...root.querySelectorAll("img")];
    Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })))
      .then(() => (document.fonts ? document.fonts.ready : 1))
      .then(() => setTimeout(() => { window.print(); }, 150));
  };
  window.addEventListener("afterprint", () => { $("#print-root").innerHTML = ""; });

  const head = (title, sub = "") => `<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #222;padding-bottom:3mm;margin-bottom:5mm">
    <div><div style="font-family:Fredoka;font-weight:700;font-size:26pt">${title}</div><div style="font-size:12pt;color:#555">${sub}</div></div>
    <div style="font-size:13pt;text-align:right">Name: ______________<br><br>Date: ______________</div></div>`;
  const foot = `<div style="position:absolute;bottom:0;left:0;right:0;text-align:center;font-family:Caveat;font-size:14pt;color:#888">StoryBloom · ⭐ Great work! ⭐</div>`;

  // A row of handwriting guide lines with dashed trace text. width in mm.
  function traceRow(text, hMM = 30, { solidFirst = false, fade = false } = {}) {
    const W = 190, H = hMM, top = H * 0.12, mid = H * 0.42, base = H * 0.72, desc = H * 0.95, fs = (base - top) * 1.38;
    let t = "";
    if (text) {
      t = `<text x="4" y="${base}" font-family="Andika" font-size="${fs}" fill="none" stroke="#9a9a9a" stroke-width="0.45" stroke-dasharray="1.6 1.2" letter-spacing="${fs * 0.25}">${text}</text>`;
      if (solidFirst) t = `<text x="4" y="${base}" font-family="Andika" font-size="${fs}" fill="#222" letter-spacing="${fs * 0.25}">${text[0]}</text>` + `<text x="4" y="${base}" font-family="Andika" font-size="${fs}" fill="none" stroke="#9a9a9a" stroke-width="0.45" stroke-dasharray="1.6 1.2" letter-spacing="${fs * 0.25}"><tspan fill="none" stroke="none">${text[0]}</tspan>${text.slice(1)}</text>`;
    }
    return `<svg viewBox="0 0 ${W} ${H}" style="width:${W}mm;height:${H}mm;display:block;margin-bottom:2mm">
      <line x1="0" x2="${W}" y1="${top}" y2="${top}" stroke="#7fb2e0" stroke-width=".4"/>
      <line x1="0" x2="${W}" y1="${mid}" y2="${mid}" stroke="#e08f7f" stroke-width=".35" stroke-dasharray="2 1.5"/>
      <line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="#7fb2e0" stroke-width=".5"/>
      <line x1="0" x2="${W}" y1="${desc}" y2="${desc}" stroke="#ddd" stroke-width=".3"/>${t}</svg>`;
  }

  /* ---------- worksheet makers ---------- */
  const MAKERS = {
    letter(l) {
      const L = LETTERS.find(x => x.l === l);
      return `<div class="sheet">${head("Letter " + l.toUpperCase() + l, "Say the sound, trace, then write it yourself!")}
        <div style="display:flex;align-items:center;gap:8mm;margin-bottom:4mm"><div style="font-family:Andika;font-weight:700;font-size:90pt;line-height:1">${l.toUpperCase()}${l}</div>
        <div style="font-size:60pt">${L.pic}</div><div style="font-size:28pt"><b>${l}</b>${L.word.slice(1)}</div></div>
        ${traceRow((l.toUpperCase() + " ").repeat(7))}${traceRow((l.toUpperCase() + " ").repeat(7))}
        ${traceRow((l + " ").repeat(8))}${traceRow((l + " ").repeat(8))}${traceRow(L.word + "  " + L.word, 30, {})}${traceRow("")}${traceRow("")}
        <div style="font-size:13pt;margin-top:2mm">✏️ Colour the picture and draw something else that starts with <b>${l}</b>:</div>
        <div style="border:2px dashed #aaa;border-radius:6mm;height:32mm;margin-top:2mm"></div>${foot}</div>`;
    },
    name(n) {
      n = (n || "Name").trim().slice(0, 12);
      const cap = n[0].toUpperCase() + n.slice(1);
      return `<div class="sheet">${head("My Name", "Trace your name, then write it on your own!")}
        <div style="font-family:Andika;font-weight:700;font-size:64pt;text-align:center;margin:2mm 0">${cap}</div>
        ${[0, 1, 2, 3, 4].map(() => traceRow(cap)).join("")}${traceRow("")}${traceRow("")}
        <div style="display:flex;gap:6mm;margin-top:4mm;font-size:13pt">${[...cap].map(c => `<div style="border:2px solid #222;border-radius:3mm;width:16mm;height:18mm;display:grid;place-items:center;font-family:Andika;font-size:22pt">${c}</div>`).join("")}</div>
        <div style="font-size:12pt;margin-top:3mm">How many letters are in your name? _____</div>${foot}</div>`;
    },
    sight(si) {
      const s = SIGHT[si]; const ws = s.words;
      // word search grid 8x8
      const N = 8, g = Array.from({ length: N }, () => Array(N).fill(""));
      ws.filter(w => w.length > 1).forEach(w => {
        w = w.toLowerCase();
        for (let tries = 0; tries < 100; tries++) {
          const dir = Math.random() < .5 ? [0, 1] : [1, 0], r = Math.floor(Math.random() * (N - (dir[0] ? w.length : 0))), c = Math.floor(Math.random() * (N - (dir[1] ? w.length : 0)));
          if ([...w].every((ch, i) => !g[r + dir[0] * i][c + dir[1] * i] || g[r + dir[0] * i][c + dir[1] * i] === ch)) { [...w].forEach((ch, i) => g[r + dir[0] * i][c + dir[1] * i] = ch); break; }
        }
      });
      const abc = "abcdefghijklmnoprstuvwy";
      const grid = g.map(row => row.map(ch => `<td>${ch || abc[Math.floor(Math.random() * abc.length)]}</td>`).join("")).map(r => `<tr>${r}</tr>`).join("");
      return `<div class="sheet">${head("Sight Words · " + s.name, "Read it · Trace it · Write it · Find it!")}
        <table style="width:100%;border-collapse:collapse;font-size:20pt">${ws.slice(0, 6).map(w => `<tr><td style="width:24%;font-family:Andika;font-weight:700;font-size:24pt;padding:1mm 0">${w}</td><td style="width:38%">${traceRow((w + "  ").repeat(2), 16).replace("width:190mm", "width:70mm")}</td><td style="border-bottom:1px solid #999"></td></tr>`).join("")}</table>
        <div style="display:flex;gap:8mm;margin-top:5mm"><table style="border-collapse:collapse;font-family:Andika;font-size:20pt">${grid}</table>
        <div style="font-size:15pt;line-height:1.7">🔍 Find these words:<br>${ws.filter(w => w.length > 1).map(w => "☐ " + w.toLowerCase()).join("<br>")}</div></div>
        <style>.sheet td{text-align:center}.sheet table[style*="Andika"] td{width:11mm;height:11mm;border:1px solid #bbb}</style>${foot}</div>`;
    },
    cutmatch() {
      const ws = shuffle(CVC).slice(0, 6);
      return `<div class="sheet">${head("Cut & Match", "Cut out the words at the bottom. Glue each word under its picture.")}
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6mm">${ws.map(w => `<div style="border:2px solid #222;border-radius:5mm;height:58mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:3mm"><div style="font-size:54pt">${w.pic}</div><div style="width:85%;height:16mm;border:2px dashed #aaa;border-radius:3mm"></div></div>`).join("")}</div>
        <div style="margin-top:10mm;border-top:2px dashed #222;padding-top:2mm;font-size:12pt">✂ cut along the lines</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0;margin-top:3mm">${shuffle(ws).map(w => `<div style="border:1.5px dashed #222;height:20mm;display:grid;place-items:center;font-family:Andika;font-weight:700;font-size:28pt">${w.w}</div>`).join("")}</div>${foot}</div>`;
    },
    family(f) {
      const ws = FAMILIES[f];
      return `<div class="sheet">${head("Word Family: -" + f, "Read each word in the house. Then make your own!")}
        <svg viewBox="0 0 190 120" style="width:190mm;height:120mm"><polygon points="20,50 95,5 170,50" fill="none" stroke="#222" stroke-width="1.2"/><rect x="30" y="50" width="130" height="68" fill="none" stroke="#222" stroke-width="1.2"/>
        <text x="95" y="40" text-anchor="middle" font-family="Andika" font-weight="700" font-size="20">-${f}</text>
        ${ws.map((w, i) => `<text x="${i % 2 ? 125 : 65}" y="${68 + Math.floor(i / 2) * 18}" text-anchor="middle" font-family="Andika" font-size="13">${PIC[w] || ""} ${w}</text>`).join("")}</svg>
        <div style="font-size:15pt;margin:3mm 0">Add a letter to make a new word:</div>
        ${[0, 1, 2, 3].map(() => `<div style="display:flex;align-items:center;gap:4mm;margin:3mm 0;font-family:Andika;font-size:30pt"><div style="width:16mm;height:18mm;border:2px solid #222;border-radius:3mm"></div><b>${f}</b><span style="font-size:14pt;color:#666;margin-left:8mm">Draw it →</span><div style="flex:1;height:18mm;border-bottom:1px solid #aaa"></div></div>`).join("")}${foot}</div>`;
    },
    begin() {
      const letters = shuffle([...new Set(CVC.map(c => c.w[0]))]).slice(0, 6);
      const rows = letters.map(l => { const t = rand(CVC.filter(c => c.w[0] === l)); const o = shuffle(CVC.filter(c => c.w[0] !== l)).slice(0, 2); return { l, opts: shuffle([t, ...o]) }; });
      return `<div class="sheet">${head("Beginning Sounds", "Say the letter sound. Circle the picture that starts with it.")}
        ${rows.map(r => `<div style="display:flex;align-items:center;gap:10mm;border-bottom:1px solid #ccc;padding:3mm 0"><div style="font-family:Andika;font-weight:700;font-size:44pt;width:22mm;text-align:center">${r.l}</div>${r.opts.map(o => `<div style="font-size:46pt;width:35mm;text-align:center">${o.pic}</div>`).join("")}</div>`).join("")}${foot}</div>`;
    },
    sequence(id) {
      const s = STORIES.find(x => x.id === id);
      return `<div class="sheet">${head("Story Order: " + s.title, "Draw the beginning, middle and end. Then tell the story!")}
        <div style="display:flex;gap:4mm;margin-bottom:4mm"><img src="assets/img/story/${s.id}-0.webp" style="width:93mm;height:62mm;object-fit:cover;border:2px solid #222"><img src="assets/img/story/${s.id}-1.webp" style="width:93mm;height:62mm;object-fit:cover;border:2px solid #222"></div>
        ${["1. Beginning", "2. Middle", "3. End"].map(t => `<div style="display:flex;gap:4mm;margin-bottom:4mm"><div style="width:80mm;height:44mm;border:2px solid #222;border-radius:3mm;padding:2mm;font-size:12pt">${t}</div><div style="flex:1">${traceRow("", 14).replace("width:190mm", "width:100mm")}${traceRow("", 14).replace("width:190mm", "width:100mm")}</div></div>`).join("")}
        <div style="font-size:14pt;border:2px dashed #888;border-radius:4mm;padding:3mm">💬 The lesson: <i>${s.moral}</i><br>What would you do? ________________________________</div>${foot}</div>`;
    },
    reader(id) {
      const b = READERS.find(x => x.id === id);
      return `<div class="sheet">${head(b.title + " · Level " + b.level, "Read the story. Then answer the questions.")}
        <div style="display:flex;gap:6mm"><img src="assets/img/reader/${b.id}.webp" style="width:80mm;height:60mm;object-fit:cover;border:2px solid #222">
        <div style="font-family:Andika;font-size:20pt;line-height:1.6">${b.pages.join("<br>")}</div></div>
        ${b.qs.map((q, i) => `<div style="margin-top:7mm;font-family:Andika;font-size:18pt"><b>${i + 1}. ${q.q}</b><br>${q.opts.map(o => "◯ " + o).join("&nbsp;&nbsp;&nbsp; ")}</div>`).join("")}
        <div style="margin-top:7mm;font-size:16pt">Draw your favourite part:</div><div style="border:2px dashed #aaa;border-radius:5mm;height:60mm;margin-top:2mm"></div>
        <div style="margin-top:4mm;font-size:16pt">I read this book to: ______________ &nbsp; ⭐ ⭐ ⭐</div>${foot}</div>`;
    },
    chart() {
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      return `<div class="sheet">${head("My Reading Chart", "Colour a star each day you read!")}
        <table style="width:100%;border-collapse:collapse;font-size:15pt;text-align:center">
        <tr><th></th>${days.map(d => `<th style="border:2px solid #222;padding:2mm">${d}</th>`).join("")}</tr>
        ${["Week 1", "Week 2", "Week 3", "Week 4"].map(w => `<tr><td style="border:2px solid #222;padding:2mm;font-weight:700">${w}</td>${days.map(() => `<td style="border:2px solid #222;height:24mm;font-size:30pt;color:#ccc">☆</td>`).join("")}</tr>`).join("")}</table>
        <div style="margin-top:8mm;font-size:16pt">When I fill a week, I get: ________________________</div>
        <div style="margin-top:6mm;font-size:16pt">Books I read this month:</div>${traceRow("", 14)}${traceRow("", 14)}${traceRow("", 14)}${traceRow("", 14)}${foot}</div>`;
    },
    colour(id) {
      const c = COLOURING.find(x => x.id === id);
      return `<div class="sheet" style="display:flex;flex-direction:column;align-items:center"><div style="font-family:Fredoka;font-size:22pt;font-weight:700;margin-bottom:3mm">${c.t}</div>
        <img src="assets/img/colour/${c.id}.png" style="width:180mm;height:240mm;object-fit:contain"><div style="font-size:13pt">Name: ______________</div></div>`;
    }
  };

  /* ---------- UI ---------- */
  const ITEMS = [
    { k: "letter", emo: "🔤", t: "Letter Tracing", s: "A–Z, pick a letter", pick: () => chooser("Pick a letter", LETTERS.map(L => ({ label: L.l.toUpperCase() + L.l, sub: L.pic, v: L.l })), v => printSheets([MAKERS.letter(v)]), 7) },
    { k: "name", emo: "🧒", t: "Name Tracing", s: "Type a name", pick: nameDialog },
    { k: "sight", emo: "👀", t: "Sight Words", s: "Read, trace, find", pick: () => chooser("Pick a word set", SIGHT.map((s, i) => ({ label: s.name, sub: s.words.slice(0, 4).join(" "), v: i })), v => printSheets([MAKERS.sight(v)]), 4) },
    { k: "cut", emo: "✂️", t: "Cut & Match", s: "Pictures + words", pick: () => printSheets([MAKERS.cutmatch()]) },
    { k: "family", emo: "🏠", t: "Word Families", s: "-at, -ug, -en…", pick: () => chooser("Pick a word family", Object.keys(FAMILIES).map(f => ({ label: "-" + f, sub: FAMILIES[f].slice(0, 3).join(" "), v: f })), v => printSheets([MAKERS.family(v)]), 5) },
    { k: "begin", emo: "👂", t: "Beginning Sounds", s: "Circle the picture", pick: () => printSheets([MAKERS.begin()]) },
    { k: "seq", emo: "📚", t: "Story Order", s: "For any story", pick: () => chooser("Pick a story", STORIES.map(s => ({ label: s.title, img: `assets/img/story/${s.id}-0.webp`, v: s.id })), v => printSheets([MAKERS.sequence(v)]), 5) },
    { k: "reader", emo: "📖", t: "Reader Questions", s: "6 little readers", pick: () => chooser("Pick a book", READERS.map(b => ({ label: b.title, sub: "Level " + b.level, img: `assets/img/reader/${b.id}.webp`, v: b.id })), v => printSheets([MAKERS.reader(v)]), 3) },
    { k: "chart", emo: "⭐", t: "Reading Chart", s: "Monthly star chart", pick: () => printSheets([MAKERS.chart()]) },
    { k: "colour", emo: "🖍️", t: "Colouring Pages", s: "Print or colour here", pick: openColouringGallery }
  ];

  window.openPrintShop = function () {
    openWin({
      title: "Print Shop",
      build(body, win) {
        blobs(win.el, ["#9ccbf0", "#f7cf4a", "#f29bb8"], 5);
        body.append(h("div", { class: "hand hint" }, "Tap a sheet → it opens the print window 🖨️"));
        const cols = $("#stage").classList.contains("portrait") ? 3 : 5;
        pager(body, ITEMS, cols * 2, (it, i) => h("button", { class: "pick", style: { transform: `rotate(${(i % 2 ? 1 : -1) * (.5 + (i % 3) * .4)}deg)`, background: ["#fff", "#fffaf0", "#f5fbff"][i % 3] }, onclick: () => { SFX.play("tap"); it.pick(); } },
          h("div", { class: "big-emo" }, it.emo), h("div", { class: "t" }, it.t), h("div", { class: "s" }, it.s)), { cols });
      }
    });
  };

  function chooser(title, opts, onPick, cols) {
    openWin({
      title,
      build(body) {
        const portrait = $("#stage").classList.contains("portrait");
        const c = portrait ? Math.min(cols, 4) : cols;
        pager(body, opts, c * (opts[0].img ? 2 : 4), o => h("button", { class: "pick", style: { padding: o.img ? 0 : "10px", justifyContent: o.img ? "flex-end" : "center" }, onclick: () => onPick(o.v) },
          o.img ? h("img", { src: o.img, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }) : null,
          h("div", { class: "t", style: o.img ? { position: "relative", background: "rgba(255,253,244,.95)", width: "100%", padding: "6px", fontSize: "20px", borderTop: "3px solid #2f2a3b" } : { fontSize: "34px" } }, o.label),
          o.sub && !o.img ? h("div", { class: "s", style: { fontSize: "26px" } }, o.sub) : null), { cols: c });
      }
    });
  }

  function nameDialog() {
    openWin({
      title: "Name Tracing",
      build(body) {
        const inp = h("input", { class: "name-in", value: APP.name || "", maxlength: 12, placeholder: "Type a name…" });
        inp.addEventListener("pointerdown", e => e.stopPropagation());
        body.append(h("div", { class: "center" }, h("div", { style: { fontSize: "90px" } }, "🧒"), h("div", { class: "hand", style: { fontSize: "38px" } }, "Whose name shall we practise?"), inp,
          h("button", { class: "pbtn green", onclick: () => { const n = inp.value.trim(); if (!n) return toast("Type a name first"); APP.name = n; save(); printSheets([MAKERS.name(n)]); } }, "🖨 Print it")));
        setTimeout(() => inp.focus(), 400);
      }
    });
  }

  /* ---------- colouring ---------- */
  function openColouringGallery() {
    openWin({
      title: "Colouring Pages",
      build(body) {
        const cols = $("#stage").classList.contains("portrait") ? 2 : 4;
        pager(body, COLOURING, cols * 2, c => h("div", { class: "pick", style: { padding: "8px", gap: "6px" } },
          h("img", { src: `assets/img/colour/${c.id}.png`, style: { height: "190px", objectFit: "contain" } }),
          h("div", { class: "t", style: { fontSize: "20px" } }, c.t),
          h("div", { style: { display: "flex", gap: "8px" } },
            h("button", { class: "pbtn small green", onclick: () => openColouring(c) }, "🖍 Colour"),
            h("button", { class: "pbtn small white", onclick: () => printSheets([MAKERS.colour(c.id)]) }, "🖨"))), { cols });
      }
    });
  }

  function openColouring(c) {
    openWin({
      title: c.t,
      build(body, win) {
        const PAL = ["#ef6f61", "#f6a04d", "#f7cf4a", "#a5d86f", "#4fb7b3", "#5b9bd5", "#9b7fd1", "#f29bb8", "#8b5e3c", "#f5d6b4", "#2f2a3b", "#ffffff"];
        let colour = PAL[0];
        const cv = h("canvas"); const ctx = cv.getContext("2d", { willReadFrequently: true });
        const pal = h("div", { class: "palette" });
        PAL.forEach((p, i) => { const b = h("button", { class: i ? "" : "on", style: { background: p } }); b.onclick = () => { colour = p; pal.querySelectorAll("button").forEach(x => x.classList.remove("on")); b.classList.add("on"); SFX.play("tap"); }; pal.append(b); });
        const undoStack = [];
        const tools = h("div", { style: { gridColumn: "1 / 3", display: "flex", gap: "10px", justifyContent: "center" } });
        body.append(h("div", { class: "colour-wrap" }, cv, h("div", { style: { display: "flex", flexDirection: "column", gap: "14px", justifyContent: "center" } }, pal,
          h("button", { class: "pbtn small white", onclick: () => { if (undoStack.length) ctx.putImageData(undoStack.pop(), 0, 0); } }, "↩ Undo"),
          h("button", { class: "pbtn small white", onclick: () => { const a = h("a", { href: cv.toDataURL("image/png"), download: c.id + "-coloured.png" }); a.click(); } }, "💾 Save"),
          h("button", { class: "pbtn small green", onclick: () => celebrate("colour:" + c.id, { msg: "Beautiful!" }) }, "🎉 Done"))));
        const img = new Image();
        img.onload = () => { cv.width = img.width; cv.height = img.height; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, cv.width, cv.height); ctx.drawImage(img, 0, 0); };
        img.src = `assets/img/colour/${c.id}.png`;
        cv.addEventListener("pointerdown", e => {
          const r = cv.getBoundingClientRect();
          // object-fit: contain → map to image pixels
          const s = Math.min(r.width / cv.width, r.height / cv.height), ox = (r.width - cv.width * s) / 2, oy = (r.height - cv.height * s) / 2;
          const x = Math.floor((e.clientX - r.left - ox) / s), y = Math.floor((e.clientY - r.top - oy) / s);
          if (x < 0 || y < 0 || x >= cv.width || y >= cv.height) return;
          const data = ctx.getImageData(0, 0, cv.width, cv.height); undoStack.push(ctx.getImageData(0, 0, cv.width, cv.height)); if (undoStack.length > 15) undoStack.shift();
          if (fill(data, x, y, colour)) { ctx.putImageData(data, 0, 0); SFX.play("pop"); } else undoStack.pop();
        });
      }
    });
  }
  // scanline flood fill; dark pixels are the line art boundaries
  function fill(img, x0, y0, hex) {
    const { width: W, height: H, data: d } = img;
    const nr = parseInt(hex.slice(1, 3), 16), ng = parseInt(hex.slice(3, 5), 16), nb = parseInt(hex.slice(5, 7), 16);
    const i0 = (y0 * W + x0) * 4, sr = d[i0], sg = d[i0 + 1], sb = d[i0 + 2];
    if (sr + sg + sb < 240) return false; // tapped on a line
    if (sr === nr && sg === ng && sb === nb) return false;
    const match = i => Math.abs(d[i] - sr) + Math.abs(d[i + 1] - sg) + Math.abs(d[i + 2] - sb) < 60 && d[i] + d[i + 1] + d[i + 2] > 240;
    const stack = [[x0, y0]];
    while (stack.length) {
      let [x, y] = stack.pop(); let i = (y * W + x) * 4;
      while (x >= 0 && match(i)) { x--; i -= 4; } x++; i += 4;
      let up = false, down = false;
      while (x < W && match(i)) {
        d[i] = nr; d[i + 1] = ng; d[i + 2] = nb; d[i + 3] = 255;
        if (y > 0) { const u = i - W * 4; if (match(u)) { if (!up) { stack.push([x, y - 1]); up = true; } } else up = false; }
        if (y < H - 1) { const dn = i + W * 4; if (match(dn)) { if (!down) { stack.push([x, y + 1]); down = true; } } else down = false; }
        x++; i += 4;
      }
    }
    return true;
  }
})();
