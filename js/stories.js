/* Bedtime Stories: library + narrated reader with timed sound effects. */
(function () {
  let lullaby = null, sleepTimer = null;

  function lullabyOn(on) {
    if (!lullaby) { lullaby = new Audio("assets/audio/music/lullaby.mp3"); lullaby.loop = true; lullaby.volume = 0.22; }
    if (on) { lullaby.play().catch(() => {}); } else lullaby.pause();
  }
  window.stopLullaby = () => lullabyOn(false);

  function starsBg(el, n = 60) {
    const box = h("div", { class: "stars-bg" });
    for (let i = 0; i < n; i++) box.append(h("i", { style: { left: Math.random() * 100 + "%", top: Math.random() * 100 + "%", animationDelay: Math.random() * 3 + "s", transform: `scale(${0.5 + Math.random()})` } }));
    el.append(box);
  }

  window.openStories = function () {
    openWin({
      title: "Bedtime Stories", night: true,
      build(body, win) {
        starsBg(win.el);
        let filter = "all";
        const tabs = h("div", { class: "tabs", style: { position: "absolute", top: "-78px", right: "24px", display: "flex", gap: "12px" } });
        const mk = (k, label) => h("button", { class: "pbtn small " + (k === filter ? "yellow" : "white"), onclick: () => { filter = k; SFX.play("tap"); draw(); } }, label);
        const lull = h("button", { class: "pbtn small purple", onclick: () => { const on = lullaby && !lullaby.paused; lullabyOn(!on); lull.textContent = on ? "🎵 Lullaby" : "🔇 Lullaby"; } }, "🎵 Lullaby");
        body.append(tabs);
        const area = h("div", { style: { position: "absolute", inset: $("#stage").classList.contains("portrait") ? "120px 0 0" : 0 } }); body.append(area);
        function draw() {
          tabs.innerHTML = ""; tabs.append(mk("all", "All 20"), mk("short", "🌟 Short"), mk("fairy", "🏰 Fairytales"), lull);
          area.innerHTML = "";
          const list = STORIES.filter(s => filter === "all" || s.kind === filter);
          const cols = $("#stage").classList.contains("portrait") ? 2 : 4;
          pager(area, list, cols * 2, (s) => {
            const done = APP.done["story:" + s.id];
            const card = h("button", { class: "pick", style: { padding: 0, justifyContent: "flex-end", transform: `rotate(${(Math.random() * 3 - 1.5).toFixed(1)}deg)` }, onclick: () => openStory(s) },
              h("img", { src: `assets/img/story/${s.id}-0.webp`, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }),
              h("div", { class: "tape " + (s.kind === "fairy" ? "pink" : "blue"), style: { top: "-8px", left: "50%", transform: "translateX(-50%) rotate(-3deg)" } }),
              h("div", { style: { position: "relative", background: "rgba(255,253,244,.94)", width: "100%", padding: "8px 10px", borderTop: "3px solid #2f2a3b" } },
                h("div", { class: "t", style: { fontSize: "22px" } }, s.title),
                h("div", { class: "s" }, (s.kind === "fairy" ? "Fairytale" : "Short story") + " · " + s.mins + " min" + (done ? " · ⭐" : ""))));
            return card;
          }, { cols });
        }
        draw();
        win.cleanup.push(() => { lullabyOn(false); });
      }
    });
  };

  function openStory(s) {
    let page = 0, playing = true, auto = true, timer = null;
    openWin({
      title: s.title, night: true,
      build(body, win) {
        starsBg(win.el, 30);
        SFX.amb(s.amb);
        SFX.preload([...new Set(s.pages.flatMap(p => (p.fx || []).map(f => typeof f === "string" ? f : f.s)))]);
        const img = h("img", { alt: "" });
        const pic = h("div", { class: "pic" }, img);
        const words = h("div", { class: "words" });
        const pnum = h("div", { class: "hand", style: { fontSize: "28px", opacity: .8, marginBottom: "6px" } });
        const playBtn = h("button", { class: "arrow", style: { width: "92px", height: "92px", fontSize: "40px", background: "#f7cf4a" } }, "⏸");
        const prev = h("button", { class: "arrow" }, "◀"), next = h("button", { class: "arrow" }, "▶");
        const again = h("button", { class: "arrow", title: "Read again" }, "🔁");
        const autoBtn = h("button", { class: "pbtn small white" }, "📖 Auto: on");
        const ctrl = h("div", { class: "book-ctrl" }, prev, again, playBtn, next, autoBtn);
        const txt = h("div", { class: "txt" }, pnum, words, ctrl);
        const book = h("div", { class: "book" }, pic, txt);
        body.append(book);

        // sleep timer + dim
        const dim = h("div", { class: "dim-layer" }); win.el.append(dim);
        const sleepOpts = [0, 10, 20, 30]; let sIdx = 0;
        const sleepBtn = h("button", { class: "pbtn small purple", style: { marginLeft: "auto" } }, "😴 Sleep timer: off");
        const lullBtn = h("button", { class: "pbtn small purple" }, lullaby && !lullaby.paused ? "🔇 Lullaby" : "🎵 Lullaby");
        lullBtn.onclick = () => { const on = lullaby && !lullaby.paused; lullabyOn(!on); lullBtn.textContent = on ? "🎵 Lullaby" : "🔇 Lullaby"; };
        sleepBtn.onclick = () => {
          sIdx = (sIdx + 1) % sleepOpts.length; const m = sleepOpts[sIdx];
          sleepBtn.textContent = "😴 Sleep timer: " + (m ? m + " min" : "off"); clearTimeout(sleepTimer);
          if (m) sleepTimer = setTimeout(goSleep, m * 60000);
        };
        function goSleep() { stopAudio(); SFX.stopAmb(); dim.style.opacity = .92; dim.style.pointerEvents = "auto"; dim.onclick = () => { dim.style.opacity = 0; dim.style.pointerEvents = "none"; };
          if (lullaby) { const f = setInterval(() => { lullaby.volume = Math.max(0, lullaby.volume - 0.01); if (lullaby.volume <= 0.01) { clearInterval(f); lullaby.pause(); lullaby.volume = .22; } }, 300); } }
        win.bar.append(lullBtn, sleepBtn);

        function render() {
          clearTimeout(timer); stopAudio();
          if (page >= s.pages.length) return moralCard();
          const p = s.pages[page];
          img.src = `assets/img/story/${s.id}-${p.img}.webp`;
          pnum.textContent = `Page ${page + 1} of ${s.pages.length}`;
          const spans = layWords(words, p.t);
          prev.disabled = page === 0;
          const fired = new Set();
          (p.fx || []).forEach(f => { if (typeof f === "string") setTimeout(() => SFX.play(f), 250); });
          const cues = (p.fx || []).filter(f => typeof f === "object");
          const clean = t => t.toLowerCase().replace(/[^a-z']/g, "");
          if (!playing) return;
          narrate(`assets/audio/stories/${s.id}/${page + 1}.mp3`, spans, p.t, {
            onWord(i) {
              const w = clean(spans[i].textContent);
              cues.forEach((c, k) => { if (!fired.has(k) && w.startsWith(clean(c.on))) { fired.add(k); SFX.play(c.s); } });
            }
          }).then(() => {
            if (win.closed || !playing) return;
            if (auto) timer = setTimeout(() => { page++; render(); }, 1400);
          });
        }
        function moralCard() {
          book.style.display = "none"; SFX.play("chime");
          const card = h("div", { class: "center" },
            h("div", { style: { fontSize: "90px" } }, "🌙"),
            cutout("The End", 64),
            h("div", { class: "torn", style: { "--torn": tornPath(), padding: "26px 40px", maxWidth: "860px", transform: "rotate(-1deg)", color: "#2f2a3b", textAlign: "center" } },
              h("div", { class: "hand", style: { fontSize: "30px" } }, "The lesson:"),
              h("div", { class: "moral" }, s.moral)),
            h("div", { class: "hand", style: { fontSize: "30px", color: "#f6f1e3", maxWidth: "800px", textAlign: "center" } }, "Talk together: What was your favourite part? What would you have done?"),
            h("div", { style: { display: "flex", gap: "16px" } },
              h("button", { class: "pbtn white", onclick: () => { card.remove(); book.style.display = ""; page = 0; playing = true; render(); } }, "🔁 Read again"),
              h("button", { class: "pbtn purple", onclick: () => { lullabyOn(true); lullBtn.textContent = "🔇 Lullaby"; sayPrompt("goodnight"); } }, "🎵 Lullaby time"),
              h("button", { class: "pbtn green", onclick: () => history.back() }, "✔ Done")));
          body.append(card);
          if (!APP.done["story:" + s.id]) setTimeout(() => celebrate("story:" + s.id, { msg: "Story time!" }), 600);
        }
        playBtn.onclick = () => {
          playing = !playing; playBtn.textContent = playing ? "⏸" : "▶";
          if (playing) render(); else { clearTimeout(timer); stopAudio(); }
        };
        again.onclick = () => { playing = true; playBtn.textContent = "⏸"; render(); };
        prev.onclick = () => { if (page > 0) { page--; render(); } };
        next.onclick = () => { page++; render(); };
        autoBtn.onclick = () => { auto = !auto; autoBtn.textContent = "📖 Auto: " + (auto ? "on" : "off"); };
        win.cleanup.push(() => { clearTimeout(timer); clearTimeout(sleepTimer); SFX.stopAmb(); });
        setTimeout(render, 450);
      }
    });
  }
  window.openStory = openStory;
})();
