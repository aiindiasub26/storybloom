/* Learn to Read: the guided course (5 steps) + games + Little Readers. */
(function () {
  const PIC = {}; CVC.forEach(c => PIC[c.w] = c.pic);
  const COLORS = ["#ef6f61", "#f6a04d", "#f7cf4a", "#7cc28a", "#4fb7b3", "#5b9bd5", "#9b7fd1", "#f29bb8"];

  /* ---------- hub ---------- */
  const GAMES = [
    { step: 1, id: "abc", title: "ABC Sounds", sub: "Tap & hear letters", emo: "blocks", age: "3+", fn: () => openABC(false) },
    { step: 1, id: "trace", title: "Trace Letters", sub: "Write with a finger", emo: "pencil", age: "3+", fn: () => openABC(true) },
    { step: 1, id: "first", title: "First Sounds", sub: "What does it start with?", emo: "ear", age: "3+", fn: openFirstSounds },
    { step: 2, id: "blend", title: "Sound Blender", sub: "c-a-t … cat!", emo: "top", age: "4+", fn: openBlender },
    { step: 2, id: "rhyme", title: "Rhyme Time", sub: "cat · hat · bat", emo: "notes", age: "4+", fn: openRhyme },
    { step: 3, id: "sight", title: "Sight Word Pop", sub: "Pop the word you hear", emo: "bubbles", age: "4+", fn: openSightPop },
    { step: 4, id: "match", title: "Picture Match", sub: "Read & match", emo: "frame", age: "5+", fn: openMatch },
    { step: 4, id: "build", title: "Build-a-Word", sub: "Spell it!", emo: "puzzle", age: "5+", fn: openBuild }
  ];

  window.openLearn = function () {
    openWin({
      title: "Learn to Read",
      build(body, win) {
        blobs(win.el, ["#f7cf4a", "#9ccbf0", "#f29bb8", "#7cc28a"], 6);
        const portrait = $("#stage").classList.contains("portrait");
        const wrap = h("div", { style: { position: "absolute", inset: "0 30px 30px", display: "grid", gap: "22px",
          gridTemplateColumns: portrait ? "1fr" : "340px 1fr", gridTemplateRows: portrait ? "300px 1fr" : "1fr" } });
        const big = h("button", { class: "pick", style: { padding: 0, justifyContent: "flex-end", background: "#fff", transform: "rotate(-1deg)" }, onclick: openLibrary },
          h("img", { src: "assets/img/reader/red-bus.webp", style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }),
          h("div", { class: "badge", style: { position: "absolute", top: "12px", left: "12px", background: "#ef6f61", color: "#fff", border: "2px solid #2f2a3b", borderRadius: "30px", padding: "4px 14px", fontWeight: 700 } }, "STEP 5"),
          h("div", { style: { position: "relative", background: "rgba(255,253,244,.95)", width: "100%", padding: "14px", borderTop: "3px solid #2f2a3b" } },
            cutout("Little Readers", 34), h("div", { class: "s", style: { marginTop: "6px" } }, "Guided reading · 6 books · 3 levels")));
        const grid = h("div", { style: { display: "grid", gridTemplateColumns: portrait ? "repeat(3,1fr)" : "repeat(4,1fr)", gap: "18px" } });
        GAMES.forEach((g, i) => {
          const n = Object.keys(APP.done).filter(k => k.startsWith("game:" + g.id)).length;
          grid.append(h("button", { class: "pick", style: { transform: `rotate(${(i % 2 ? 1 : -1) * (0.6 + Math.random())}deg)`, background: i % 3 === 0 ? "#fffaf0" : "#fff" }, onclick: g.fn },
            h("div", { style: { position: "absolute", top: "8px", left: "10px", fontWeight: 700, fontSize: "16px", background: COLORS[g.step * 2 - 2], color: "#fff", padding: "2px 10px", borderRadius: "20px", border: "2px solid #2f2a3b" } }, "STEP " + g.step),
            n ? h("div", { class: "stars" }, starRow(Math.min(3, n))) : null,
            h("div", { class: "big-emo" }, pic(g.emo, 96)), h("div", { class: "t" }, g.title), h("div", { class: "s" }, g.sub)));
        });
        wrap.append(big, grid); body.append(wrap);
      }
    });
  };

  /* ---------- shared round-based game frame ---------- */
  function game({ title, key, rounds, bg, round }) {
    openWin({
      title, bg,
      build(body, win) {
        blobs(win.el, ["#f7cf4a", "#9ccbf0", "#f29bb8"], 4);
        const prog = h("div", { class: "prog" }); win.bar.append(h("div", { style: { flex: 1 } }), prog);
        for (let i = 0; i < rounds; i++) prog.append(h("i", {}, icon("star", 30)));
        const stage = h("div", { class: "center" }); body.append(stage);
        let r = 0, misses = 0;
        const next = async (ok = true) => {
          if (win.closed) return;
          prog.children[r].classList.add("on"); r++;
          if (r >= rounds) { await wait(500); await celebrate("game:" + key + ":" + Date.now().toString().slice(0, 7), { stars: misses < 2 ? 3 : 2, msg: "Super!" }); history.back(); return; }
          await wait(700); stage.innerHTML = ""; round(stage, next, () => misses++, r, win);
        };
        setTimeout(() => round(stage, next, () => misses++, 0, win), 400);
      }
    });
  }
  function choiceBtn(content, cls, onPick) {
    const b = h("button", { class: "pick choice " + (cls || "") }, content);
    b.onclick = () => onPick(b); return b;
  }
  const speaker = (fn) => h("button", { class: "speaker", "aria-label": "Listen again", onclick: fn }, icon("speaker", 58));

  /* ---------- ABC wall + letter card with tracing ---------- */
  function openABC(traceMode) {
    openWin({
      title: traceMode ? "Trace Letters" : "ABC Sounds",
      build(body, win) {
        const cols = $("#stage").classList.contains("portrait") ? 5 : 9;
        const grid = h("div", { class: "grid", style: { gridTemplateColumns: `repeat(${cols},1fr)`, gap: "14px" } });
        LETTERS.forEach((L, i) => {
          const done = APP.done["letter:" + L.l];
          grid.append(h("button", { class: "pick", style: { background: COLORS[i % COLORS.length], transform: `rotate(${(Math.random() * 6 - 3).toFixed(1)}deg)`, padding: "6px" },
            onclick: () => { SFX.play("tap"); openLetter(i, traceMode); } },
            h("div", { class: "read", style: { fontSize: "56px", fontWeight: 700, lineHeight: 1, color: "#2f2a3b" } }, L.l.toUpperCase() + L.l),
            pic(L.pic, 40), done ? h("div", { class: "stars" }, starRow(1)) : null));
        });
        body.append(grid);
      }
    });
  }

  function openLetter(i, traceFirst) {
    const L = LETTERS[i];
    openWin({
      title: "Letter " + L.l.toUpperCase(),
      build(body, win) {
        blobs(win.el, [COLORS[i % COLORS.length], "#fbe3c0"], 4);
        const portrait = $("#stage").classList.contains("portrait");
        const left = h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" } },
          h("div", { class: "letter-big", style: { color: COLORS[i % COLORS.length], textShadow: "5px 5px 0 #2f2a3b" } }, L.l.toUpperCase() + L.l),
          pic(L.pic, 130),
          h("div", { class: "read", style: { fontSize: "54px" } }, h("b", { style: { color: COLORS[i % COLORS.length] } }, L.word[0]), L.word.slice(1)),
          h("div", { style: { display: "flex", gap: "14px" } },
            h("button", { class: "pbtn", onclick: () => sayLetter(L.l) }, ib("speaker", "Hear it")),
            h("button", { class: "pbtn blue", onclick: () => saySound(L.l) }, ib("ear", "Sound"))));
        const tr = tracer(L.l, () => { celebrate("letter:" + L.l, { msg: "Beautiful!" }); });
        const caseBtn = h("button", { class: "pbtn small white" }, "Try: " + L.l.toUpperCase());
        let upper = false; caseBtn.onclick = () => { upper = !upper; tr.set(upper ? L.l.toUpperCase() : L.l); caseBtn.textContent = "Try: " + (upper ? L.l : L.l.toUpperCase()); };
        const right = h("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" } },
          h("div", { class: "hand", style: { fontSize: "34px" } }, "Trace it with your finger!"), tr.el,
          h("div", { style: { display: "flex", gap: "12px" } }, h("button", { class: "pbtn small white", onclick: () => tr.clear() }, ib("eraser", "Clear", 22)), caseBtn));
        const nav = h("div", { class: "pager" },
          h("button", { class: "arrow", disabled: i === 0, onclick: () => { win.close(); openLetter(i - 1, traceFirst); } }, icon("left", 34)),
          h("button", { class: "arrow", disabled: i === 25, onclick: () => { win.close(); openLetter(i + 1, traceFirst); } }, icon("right", 34)));
        body.append(h("div", { style: { position: "absolute", inset: "0 30px 100px", display: "grid", gridTemplateColumns: portrait ? "1fr" : "1fr 1fr", alignItems: "center", justifyItems: "center" } }, left, right), nav);
        setTimeout(() => traceFirst ? sayPrompt("trace") : sayLetter(L.l), 400);
      }
    });
  }

  // Finger tracing pad with coverage check.
  function tracer(ch, onDone) {
    const W = 420, H = 460;
    const wrap = h("div", { class: "trace-wrap" });
    const guide = h("canvas", { width: W, height: H }), ink = h("canvas", { width: W, height: H });
    wrap.append(guide, ink);
    const g = guide.getContext("2d"), k = ink.getContext("2d");
    const mask = document.createElement("canvas"); mask.width = W; mask.height = H; const m = mask.getContext("2d");
    let target = 0, done = false, cur = ch;
    function draw() {
      [g, m].forEach(c => { c.clearRect(0, 0, W, H); c.textAlign = "center"; c.textBaseline = "middle"; c.font = "700 360px Andika, sans-serif"; });
      g.fillStyle = "#efe6d4"; g.fillText(cur, W / 2, H / 2 + 10);
      g.setLineDash([10, 12]); g.lineWidth = 4; g.strokeStyle = "#a99b80"; g.strokeText(cur, W / 2, H / 2 + 10); g.setLineDash([]);
      g.strokeStyle = "#cfe2f2"; g.lineWidth = 2; [110, 230, 350].forEach(y => { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); });
      m.fillStyle = "#000"; m.fillText(cur, W / 2, H / 2 + 10);
      const d = m.getImageData(0, 0, W, H).data; target = 0; for (let i = 3; i < d.length; i += 16) if (d[i] > 128) target++;
    }
    function coverage() {
      const a = m.getImageData(0, 0, W, H).data, b = k.getImageData(0, 0, W, H).data; let hit = 0;
      for (let i = 3; i < a.length; i += 16) if (a[i] > 128 && b[i] > 0) hit++;
      return hit / Math.max(1, target);
    }
    let drawing = false, last = null, color = rand(COLORS);
    const pos = e => { const r = ink.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    ink.addEventListener("pointerdown", e => { drawing = true; last = pos(e); ink.setPointerCapture(e.pointerId); });
    ink.addEventListener("pointermove", e => {
      if (!drawing) return; const p = pos(e);
      k.strokeStyle = color; k.lineWidth = 34; k.lineCap = k.lineJoin = "round";
      k.beginPath(); k.moveTo(...last); k.lineTo(...p); k.stroke(); last = p;
    });
    ink.addEventListener("pointerup", () => {
      drawing = false;
      if (!done && coverage() > 0.62) { done = true; SFX.play("right"); setTimeout(onDone, 300); }
    });
    document.fonts && document.fonts.ready.then(draw); draw();
    return { el: wrap, clear() { k.clearRect(0, 0, W, H); done = false; color = rand(COLORS); }, set(c) { cur = c; this.clear(); draw(); } };
  }

  /* ---------- First Sounds ---------- */
  function openFirstSounds() {
    const byLetter = {}; CVC.forEach(c => (byLetter[c.w[0]] = byLetter[c.w[0]] || []).push(c));
    const letters = shuffle(Object.keys(byLetter));
    game({
      title: "First Sounds", key: "first", rounds: 6,
      round(st, next, miss, r) {
        const l = letters[r % letters.length], target = rand(byLetter[l]);
        const others = shuffle(CVC.filter(c => c.w[0] !== l)).slice(0, 2);
        const play = () => saySound(l);
        st.append(h("div", { class: "hand", style: { fontSize: "40px" } }, "Which picture starts with…"),
          h("div", { style: { display: "flex", alignItems: "center", gap: "30px" } }, h("div", { class: "letter-big", style: { fontSize: "170px" } }, l), speaker(play)));
        const row = h("div", { class: "choice-row" });
        shuffle([target, ...others]).forEach(c => row.append(choiceBtn(pic(c.pic, 130), "emo", async b => {
          if (c === target) { b.classList.add("right"); SFX.play("right"); await sayWord(c.w); next(); }
          else { b.classList.add("wrong"); SFX.play("wrong"); miss(); sayWord(c.w); setTimeout(() => b.classList.remove("wrong"), 500); }
        })));
        st.append(row);
        sayPrompt("firstSound").then(play);
      }
    });
  }

  /* ---------- Sound Blender ---------- */
  function openBlender() {
    const words = shuffle(CVC).slice(0, 6);
    game({
      title: "Sound Blender", key: "blend", rounds: 6,
      round(st, next, miss, r) {
        const w = words[r]; const tapped = new Set();
        const picEl = h("div", { style: { height: "170px", opacity: 0, transition: "opacity .4s" } }, pic(w.pic, 170));
        const tiles = h("div", { style: { display: "flex", gap: "22px" } });
        const blend = h("button", { class: "pbtn green", disabled: true, style: { fontSize: "34px" } }, ib("blend", "Blend it!", 30));
        [...w.w].forEach((ch, i) => {
          const t = h("button", { class: "tile-l", style: { background: ["#fde2e0", "#fff3c4", "#d7efe0"][i] } }, ch);
          t.onclick = async () => { SFX.play("tap"); t.classList.add("lit"); tapped.add(i); await saySound(ch); t.classList.remove("lit"); if (tapped.size === 3) blend.disabled = false; };
          tiles.append(t);
        });
        blend.onclick = async () => {
          blend.disabled = true;
          for (const t of tiles.children) { t.classList.add("lit"); await saySound(t.textContent); t.classList.remove("lit"); }
          await wait(150); tiles.style.gap = "2px"; picEl.style.opacity = 1; SFX.play("magic"); await sayWord(w.w); next();
        };
        st.append(h("div", { class: "hand", style: { fontSize: "40px" } }, "Tap each sound, then blend!"), picEl, tiles, blend);
        if (r === 0) sayPrompt("blend");
      }
    });
  }

  /* ---------- Rhyme Time ---------- */
  function openRhyme() {
    const fams = Object.entries(FAMILIES).map(([k, ws]) => [k, ws.filter(w => PIC[w])]).filter(([k, ws]) => ws.length >= 2);
    game({
      title: "Rhyme Time", key: "rhyme", rounds: 6,
      round(st, next, miss, r) {
        const [fam, ws] = rand(fams); const [a, b] = shuffle(ws);
        const others = shuffle(fams.filter(f => f[0] !== fam)).slice(0, 2).map(f => rand(f[1]));
        st.append(h("div", { class: "hand", style: { fontSize: "40px" } }, "Which one rhymes with…"),
          h("button", { class: "pick", style: { padding: "10px 40px" }, onclick: () => sayWord(a) }, pic(PIC[a], 130), h("div", { class: "read", style: { fontSize: "50px", fontWeight: 700 } }, a)));
        const row = h("div", { class: "choice-row" });
        shuffle([b, ...others]).forEach(w => row.append(choiceBtn([pic(PIC[w], 100), h("div", { class: "read", style: { fontSize: "36px" } }, w)], "", async btn => {
          if (w === b) { btn.classList.add("right"); SFX.play("right"); await sayWord(a); await sayWord(b); next(); }
          else { btn.classList.add("wrong"); SFX.play("wrong"); miss(); sayWord(w); setTimeout(() => btn.classList.remove("wrong"), 500); }
        })));
        st.append(row);
        sayPrompt("rhyme").then(() => sayWord(a));
      }
    });
  }

  /* ---------- Sight Word Pop ---------- */
  function openSightPop() {
    openWin({
      title: "Sight Word Pop",
      build(body) {
        const c = h("div", { class: "center" }, h("div", { class: "hand", style: { fontSize: "40px" } }, "Choose a word set"));
        const row = h("div", { class: "choice-row" });
        SIGHT.forEach((s, i) => row.append(h("button", { class: "pick", style: { width: "250px", height: "250px", background: s.color }, onclick: () => playSight(i) },
          h("div", { class: "t", style: { fontSize: "34px" } }, s.name), h("div", { class: "read", style: { fontSize: "26px" } }, s.words.slice(0, 5).join(" · ")),
          APP.done["game:sight" + i] ? h("div", { class: "stars" }, starRow(1)) : null)));
        c.append(row); body.append(c);
      }
    });
  }
  function playSight(si) {
    const set = SIGHT[si]; const order = shuffle(set.words).slice(0, 8);
    game({
      title: "Pop the Word: " + set.name, key: "sight" + si, rounds: 8,
      round(st, next, miss, r, win) {
        const target = order[r]; const opts = shuffle([target, ...shuffle(set.words.filter(w => w !== target)).slice(0, 3)]);
        st.style.justifyContent = "flex-start"; st.style.paddingTop = "10px";
        st.append(h("div", { style: { display: "flex", alignItems: "center", gap: "20px" } }, h("div", { class: "hand", style: { fontSize: "40px" } }, "Pop the word you hear!"), speaker(() => sayWord(target))));
        const field = h("div", { style: { position: "relative", width: "100%", flex: 1 } }); st.append(field);
        const portrait = $("#stage").classList.contains("portrait");
        const spots = portrait ? [[12, 8], [55, 12], [10, 52], [56, 56]] : [[8, 18], [30, 45], [55, 12], [76, 42]];
        opts.forEach((w, i) => {
          const b = h("button", { class: "bubble", style: { left: spots[i][0] + "%", top: spots[i][1] + "%", "--bc": set.color + "aa", animationDelay: (i * .5) + "s" } }, w);
          b.onclick = async () => {
            if (w === target) { b.classList.add("popped"); SFX.play("pop"); SFX.play("right", .1); await sayWord(w); next(); }
            else { SFX.play("wrong"); miss(); b.animate([{ transform: "translateX(-10px)" }, { transform: "translateX(10px)" }, { transform: "none" }], { duration: 300 }); sayWord(w); }
          };
          field.append(b);
        });
        (r === 0 ? sayPrompt("tapWord") : Promise.resolve()).then(() => sayWord(target));
      }
    });
  }

  /* ---------- Picture Match ---------- */
  function openMatch() {
    const words = shuffle(CVC).slice(0, 8);
    game({
      title: "Picture Match", key: "match", rounds: 8,
      round(st, next, miss, r) {
        const w = words[r]; const opts = shuffle([w, ...shuffle(CVC.filter(c => c.w !== w.w && (c.w[1] === w.w[1] || c.w[0] === w.w[0]))).slice(0, 2)]);
        while (opts.length < 3) opts.push(rand(CVC.filter(c => !opts.includes(c))));
        st.append(h("div", { class: "hand", style: { fontSize: "40px" } }, "Read the words. Which one is this?"), pic(w.pic, 190));
        const row = h("div", { class: "choice-row" });
        opts.forEach(o => row.append(choiceBtn(o.w, "", async b => {
          if (o === w) { b.classList.add("right"); SFX.play("right"); await sayWord(o.w); next(); }
          else { b.classList.add("wrong"); SFX.play("wrong"); miss(); sayWord(o.w); setTimeout(() => b.classList.remove("wrong"), 500); }
        })));
        st.append(row); if (r === 0) sayPrompt("match");
      }
    });
  }

  /* ---------- Build-a-Word ---------- */
  function openBuild() {
    const words = shuffle(CVC).slice(0, 6);
    game({
      title: "Build-a-Word", key: "build", rounds: 6,
      round(st, next, miss, r) {
        const w = words[r]; const letters = shuffle([...w.w, ...shuffle("abcdefghilmnoprstuw".split("").filter(c => !w.w.includes(c))).slice(0, 2)]);
        const slots = h("div", { style: { display: "flex", gap: "16px" } }), filled = [null, null, null];
        const tray = h("div", { style: { display: "flex", gap: "16px" } });
        const drawSlots = () => {
          slots.innerHTML = "";
          filled.forEach((t, i) => { const s = h("button", { class: "tile-l" + (t ? "" : " slot") }, t ? t.ch : ""); s.onclick = () => { if (t) { t.el.style.visibility = ""; filled[i] = null; drawSlots(); } }; slots.append(s); });
        };
        letters.forEach(ch => {
          const el = h("button", { class: "tile-l", style: { background: "#fff3c4" } }, ch);
          el.onclick = async () => {
            const i = filled.indexOf(null); if (i < 0) return;
            filled[i] = { ch, el }; el.style.visibility = "hidden"; drawSlots(); saySound(ch);
            if (!filled.includes(null)) {
              const word = filled.map(f => f.ch).join("");
              await wait(500);
              if (word === w.w) { SFX.play("right"); slots.querySelectorAll(".tile-l").forEach(t => t.style.background = "#c6ecc9"); await sayWord(w.w); next(); }
              else { SFX.play("wrong"); miss(); slots.animate([{ transform: "translateX(-12px)" }, { transform: "translateX(12px)" }, { transform: "none" }], { duration: 350 });
                await wait(500); filled.forEach((f, k) => { f.el.style.visibility = ""; filled[k] = null; }); drawSlots(); sayWord(w.w); }
            }
          };
          tray.append(el);
        });
        drawSlots();
        st.append(h("div", { style: { display: "flex", alignItems: "center", gap: "30px" } }, pic(w.pic, 170), speaker(() => sayWord(w.w))), slots, h("div", { style: { height: "10px" } }), tray);
        (r === 0 ? sayPrompt("build") : Promise.resolve()).then(() => sayWord(w.w));
      }
    });
  }

  /* ---------- Little Readers: guided reading ---------- */
  function openLibrary() {
    openWin({
      title: "Little Readers",
      build(body, win) {
        blobs(win.el, ["#c7b8ea", "#a8dab5", "#ffd479"], 5);
        const cols = $("#stage").classList.contains("portrait") ? 2 : 3;
        body.append(h("div", { class: "hand hint" }, "Level 1 → 2 → 3: start at the top!"));
        pager(body, READERS, 6, (b, i) => {
          const st = APP.done["reader:" + b.id];
          return h("button", { class: "pick", style: { padding: 0, justifyContent: "flex-end", background: b.color, transform: `rotate(${(i % 2 ? 1 : -1) * 1.2}deg)` }, onclick: () => openBook(b) },
            h("img", { src: `assets/img/reader/${b.id}.webp`, style: { position: "absolute", inset: "0 0 70px 0", width: "100%", height: "calc(100% - 70px)", objectFit: "cover" } }),
            h("div", { class: "tape", style: { top: "-6px", left: "20px", transform: "rotate(-6deg)" } }),
            h("div", { style: { position: "absolute", top: "10px", right: "10px", background: "#fff", border: "2px solid #2f2a3b", borderRadius: "20px", padding: "2px 12px", fontWeight: 700 } }, "Level " + b.level),
            h("div", { style: { position: "relative", height: "70px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", borderTop: "3px solid #2f2a3b" } },
              h("div", { class: "t" }, b.title), st ? starRow(st) : null));
        }, { cols });
      }
    });
  }

  function openBook(b) {
    openWin({
      title: b.title,
      build(body, win) {
        blobs(win.el, [b.color, "#fbe3c0"], 3);
        // choose a reading mode
        const modes = h("div", { class: "center" },
          h("img", { src: `assets/img/reader/${b.id}.webp`, style: { width: "380px", border: "4px solid #fff", outline: "3px solid #2f2a3b", transform: "rotate(-2deg)", boxShadow: "6px 8px 0 rgba(0,0,0,.2)" } }),
          h("div", { class: "hand", style: { fontSize: "38px" } }, "How shall we read today?"),
          h("div", { class: "choice-row" },
            h("button", { class: "pbtn yellow", style: { fontSize: "30px" }, onclick: () => start("listen") }, ib("ear", "Read to me", 30)),
            h("button", { class: "pbtn blue", style: { fontSize: "30px" }, onclick: () => start("echo") }, ib("parrot", "Echo read", 30)),
            h("button", { class: "pbtn green", style: { fontSize: "30px" }, onclick: () => start("solo") }, ib("book", "I'll read!", 30))));
        body.append(modes);
        let page = 0, mode = "listen", rec = null, recUrl = null;
        const img = h("img", { src: `assets/img/reader/${b.id}.webp` });
        const words = h("div", { class: "words big" });
        const tools = h("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", marginTop: "20px" } });
        const prev = h("button", { class: "arrow", "aria-label": "Previous page" }, icon("left", 34)), next = h("button", { class: "arrow", "aria-label": "Next page" }, icon("right", 34));
        const txt = h("div", { class: "txt" }, h("div", { class: "hand pnum", style: { fontSize: "28px" } }), words, tools, h("div", { class: "book-ctrl" }, prev, next));
        const book = h("div", { class: "book", style: { display: "none" } }, h("div", { class: "pic" }, img), txt);
        body.append(book);
        function start(m) { mode = m; modes.remove(); book.style.display = ""; page = 0; show(); }
        const clip = () => `assets/audio/readers/${b.id}/${page + 1}.mp3`;
        function show() {
          stopAudio(); tools.innerHTML = "";
          if (page >= b.pages.length) return quiz();
          txt.querySelector(".pnum").textContent = `Page ${page + 1} of ${b.pages.length}`;
          const spans = layWords(words, b.pages[page]);
          prev.disabled = page === 0;
          const hear = h("button", { class: "pbtn small" }, ib("speaker", "Hear it", 22));
          hear.onclick = () => narrate(clip(), spans, b.pages[page]);
          if (mode === "listen") {
            narrate(clip(), spans, b.pages[page]).then(() => { if (!win.closed && mode === "listen") setTimeout(() => { if (!win.closed && words.isConnected) { page++; show(); } }, 1300); });
            tools.append(hear);
          } else if (mode === "echo") {
            narrate(clip(), spans, b.pages[page]).then(async () => { await sayPrompt("yourTurn"); spans.forEach(s => s.classList.add("tap")); setTimeout(() => spans.forEach(s => s.classList.remove("tap")), 1500); });
            tools.append(hear, recBtn());
          } else {
            tools.append(h("div", { class: "hand", style: { fontSize: "28px", width: "100%", textAlign: "center" } }, "Tap any tricky word for help."), hear, recBtn());
          }
        }
        function recBtn() {
          const btn = h("button", { class: "pbtn small pink" }, ib("mic", "Record me", 22));
          const play = h("button", { class: "pbtn small white", style: { display: recUrl ? "" : "none" } }, ib("play", "Listen to me", 22));
          play.onclick = () => playClip(recUrl);
          btn.onclick = async () => {
            if (rec && rec.state === "recording") { rec.stop(); return; }
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const chunks = []; rec = new MediaRecorder(stream);
              rec.ondataavailable = e => chunks.push(e.data);
              rec.onstop = () => { stream.getTracks().forEach(t => t.stop()); recUrl = URL.createObjectURL(new Blob(chunks)); setIb(btn, "mic", "Record again", 22); play.style.display = ""; SFX.play("chime"); };
              rec.start(); setIb(btn, "stop", "Stop", 22); setTimeout(() => rec && rec.state === "recording" && rec.stop(), 15000);
            } catch (e) { toast("Microphone not available. Ask a grown-up to allow it."); }
          };
          win.cleanup.push(() => { if (rec && rec.state === "recording") rec.stop(); });
          const box = h("span", { style: { display: "contents" } }, btn, play); return box;
        }
        prev.onclick = () => { if (page > 0) { page--; show(); } };
        next.onclick = () => { page++; show(); };
        let wrongs = 0;
        function quiz(qi = 0) {
          book.style.display = "none"; stopAudio();
          const old = body.querySelector(".quiz"); if (old) old.remove();
          if (qi >= b.qs.length) {
            const stars = wrongs === 0 ? 3 : wrongs < 2 ? 2 : 1;
            APP.done["reader:" + b.id] = Math.max(APP.done["reader:" + b.id] || 0, stars); save();
            celebrate("readerdone:" + b.id, { stars, msg: "Great Reading!" }).then(() => history.back()); return;
          }
          const q = b.qs[qi];
          const qtext = h("div", { class: "words", style: { fontSize: "46px", textAlign: "center" } });
          layWords(qtext, q.q);
          const row = h("div", { class: "choice-row" });
          q.opts.forEach((o, k) => {
            const btn = h("button", { class: "pick", style: { minWidth: "260px", minHeight: "120px", fontSize: "34px", fontFamily: "var(--read)" } }, o);
            btn.onclick = () => { if (k === q.a) { btn.classList.add("right"); SFX.play("right"); setTimeout(() => quiz(qi + 1), 900); } else { wrongs++; btn.classList.add("wrong"); SFX.play("wrong"); sayPrompt("tryAgain"); setTimeout(() => btn.classList.remove("wrong"), 500); } };
            row.append(btn);
          });
          body.append(h("div", { class: "center quiz" }, cutout("Question " + (qi + 1), 40), qtext, row));
        }
      }
    });
  }
  window.openLibrary = openLibrary;
})();
