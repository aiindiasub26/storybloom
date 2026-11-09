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
        const lull = h("button", { class: "pbtn small purple", onclick: () => { const on = lullaby && !lullaby.paused; lullabyOn(!on); setIb(lull, "music", on ? "Lullaby" : "Lullaby off", 20); } }, ib("music", "Lullaby", 20));
        body.append(tabs);
        const area = h("div", { style: { position: "absolute", inset: $("#stage").classList.contains("portrait") ? "120px 0 0" : 0 } }); body.append(area);
        function draw() {
          tabs.innerHTML = ""; tabs.append(mk("all", "All 20"), mk("short", "Short stories"), mk("fairy", "Fairytales"), lull);
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
                h("div", { class: "s" }, (s.kind === "fairy" ? "Fairytale" : "Short story") + " · " + s.mins + " min" + (done ? " · done" : ""))));
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
        const playBtn = h("button", { class: "arrow", style: { width: "92px", height: "92px", background: "#f7cf4a" }, "aria-label": "Play or pause" }, icon("pause", 44));
        const prev = h("button", { class: "arrow", "aria-label": "Previous page" }, icon("left", 34)), next = h("button", { class: "arrow", "aria-label": "Next page" }, icon("right", 34));
        const again = h("button", { class: "arrow", title: "Read again", "aria-label": "Read this page again" }, icon("again", 34));
        const autoBtn = h("button", { class: "pbtn small white" }, ib("book", "Auto-turn", 20));
        const ctrl = h("div", { class: "book-ctrl" }, prev, again, playBtn, next, autoBtn);
        const txt = h("div", { class: "txt" }, pnum, words, ctrl);
        const book = h("div", { class: "book" }, pic, txt);
        body.append(book);

        // sleep timer + dim
        const dim = h("div", { class: "dim-layer" }); win.el.append(dim);
        const sleepOpts = [0, 10, 20, 30]; let sIdx = 0;
        const sleepBtn = h("button", { class: "pbtn small purple" }, ib("sleep", "Sleep: off", 20));
        const lullBtn = h("button", { class: "pbtn small purple" }, ib("music", lullaby && !lullaby.paused ? "Lullaby off" : "Lullaby", 20));
        lullBtn.onclick = () => { const on = lullaby && !lullaby.paused; lullabyOn(!on); setIb(lullBtn, "music", on ? "Lullaby" : "Lullaby off", 20); };
        sleepBtn.onclick = () => {
          sIdx = (sIdx + 1) % sleepOpts.length; const m = sleepOpts[sIdx];
          setIb(sleepBtn, "sleep", "Sleep: " + (m ? m + " min" : "off"), 20); clearTimeout(sleepTimer);
          if (m) sleepTimer = setTimeout(goSleep, m * 60000);
        };
        function goSleep() { stopAudio(); SFX.stopAmb(); dim.style.opacity = .92; dim.style.pointerEvents = "auto"; dim.onclick = () => { dim.style.opacity = 0; dim.style.pointerEvents = "none"; };
          if (lullaby) { const f = setInterval(() => { lullaby.volume = Math.max(0, lullaby.volume - 0.01); if (lullaby.volume <= 0.01) { clearInterval(f); lullaby.pause(); lullaby.volume = .22; } }, 300); } }
        const tgl = (key, on, off, after) => {
          const b = h("button", { class: "pbtn small " + (APPSET[key] ? "white" : "purple") }, ib(...(APPSET[key] ? on : off), 20));
          b.onclick = () => { APPSET[key] = !APPSET[key]; save(); setIb(b, ...(APPSET[key] ? on : off), 20); b.className = "pbtn small " + (APPSET[key] ? "white" : "purple"); after && after(APPSET[key]); };
          return b;
        };
        const sfxBtn = tgl("sfx", ["bell", "Effects on"], ["belloff", "Effects off"]);
        const ambBtn = tgl("amb", ["leaf", "Nature on"], ["leafoff", "Nature off"], on => on ? SFX.amb(s.amb) : SFX.stopAmb());
        sfxBtn.style.marginLeft = "auto";
        win.bar.append(sfxBtn, ambBtn, lullBtn, sleepBtn);

        function render() {
          clearTimeout(timer); stopAudio();
          if (page >= s.pages.length) return moralCard();
          const p = s.pages[page];
          img.src = `assets/img/story/${s.id}-${p.img}.webp`;
          pnum.textContent = `Page ${page + 1} of ${s.pages.length}`;
          const spans = layWords(words, p.t);
          prev.disabled = page === 0;
          const fired = new Set();
          const starts = (p.fx || []).filter(f => typeof f === "string");
          const cues = (p.fx || []).filter(f => typeof f === "object");
          const clean = t => t.toLowerCase().replace(/[^a-z']/g, "");
          if (!playing) return;
          // 1) page-start effects play on their own, in full, before the narrator speaks
          let lead = 0;
          if (APPSET.sfx) starts.forEach(f => { lead = Math.max(lead, SFX.play(f, 0.15, { max: 2.2 })); });
          const myPage = page;
          timer = setTimeout(() => {
            if (win.closed || !playing || page !== myPage) return;
            SFX.duck(true);
            // 2) effects inside a sentence stay soft and short so the voice stays clear
            narrate(`assets/audio/stories/${s.id}/${page + 1}.mp3`, spans, p.t, {
              onWord(i) {
                const w = clean(spans[i].textContent);
                cues.forEach((c, k) => { if (!fired.has(k) && w.startsWith(clean(c.on))) { fired.add(k); SFX.play(c.s, 0, { gain: 0.32, max: 1.3 }); } });
              }
            }).then(() => {
              SFX.duck(false);
              if (win.closed || !playing) return;
              if (auto) timer = setTimeout(() => { page++; render(); }, 1600);
            });
          }, lead ? Math.min(lead, 2.2) * 1000 + 150 : 250);
        }
        function moralCard() {
          book.style.display = "none"; SFX.play("chime");
          const idx = STORIES.indexOf(s), nextS = STORIES[(idx + 1) % STORIES.length];
          let countT = 0, left = 12;
          const stopCount = () => { clearInterval(countT); countT = 0; nextRow.style.display = "none"; };
          const goNext = () => { stopCount(); history.back(); setTimeout(() => openStory(nextS), 420); };
          const countTxt = h("span", {});
          const nextRow = h("div", { class: "next-story", style: { display: "none", alignItems: "center", gap: "14px", flexWrap: "wrap", justifyContent: "center" } },
            h("img", { src: `assets/img/story/${nextS.id}-0.webp`, alt: "", style: { width: "92px", height: "92px", objectFit: "cover", borderRadius: "14px", border: "3px solid #2f2a3b" } }),
            h("div", { class: "hand", style: { fontSize: "28px", color: "#f6f1e3" } }, "Next: ", h("b", {}, nextS.title), " ", countTxt),
            h("button", { class: "pbtn yellow", onclick: goNext }, ib("right", "Play now")),
            h("button", { class: "pbtn white small", onclick: stopCount }, ib("pause", "Stay here", 20)));
          const card = h("div", { class: "center", style: { overflowY: "auto", gap: "18px" } },
            window.pic("moon", 110),
            cutout("The End", 64),
            h("div", { class: "torn", style: { "--torn": tornPath(), padding: "26px 40px", maxWidth: "860px", transform: "rotate(-1deg)", color: "#2f2a3b", textAlign: "center" } },
              h("div", { class: "hand", style: { fontSize: "30px" } }, "The lesson:"),
              h("div", { class: "moral" }, s.moral)),
            h("div", { class: "hand", style: { fontSize: "30px", color: "#f6f1e3", maxWidth: "800px", textAlign: "center" } }, "Talk together: What was your favourite part? What would you have done?"),
            h("div", { style: { display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" } },
              h("button", { class: "pbtn white", onclick: () => { stopCount(); card.remove(); book.style.display = ""; page = 0; playing = true; render(); } }, ib("again", "Read again")),
              h("button", { class: "pbtn purple", onclick: () => { stopCount(); lullabyOn(true); setIb(lullBtn, "music", "Lullaby off", 20); sayPrompt("goodnight"); } }, ib("moon", "Lullaby time")),
              h("button", { class: "pbtn green", onclick: () => { stopCount(); history.back(); } }, ib("check", "Done"))),
            nextRow);
          body.append(card);
          win.cleanup.push(stopCount);
          const first = !APP.done["story:" + s.id];
          const cele = first ? wait(600).then(() => celebrate("story:" + s.id, { msg: "Story time!", autoClose: 6000 })) : Promise.resolve();
          // with Auto-turn on, the next story starts by itself after a short countdown
          cele.then(() => {
            if (!auto || win.closed || !card.isConnected) return;
            nextRow.style.display = "flex"; countTxt.textContent = "in " + left + "…";
            countT = setInterval(() => {
              if (win.closed || !card.isConnected) return stopCount();
              left--; countTxt.textContent = "in " + left + "…";
              if (left <= 0) goNext();
            }, 1000);
          });
        }
        playBtn.onclick = () => {
          playing = !playing; setIb(playBtn, playing ? "pause" : "play", "", 44);
          if (playing) render(); else { clearTimeout(timer); stopAudio(); }
        };
        again.onclick = () => { playing = true; setIb(playBtn, "pause", "", 44); render(); };
        prev.onclick = () => { if (page > 0) { page--; render(); } };
        next.onclick = () => { page++; render(); };
        autoBtn.onclick = () => { auto = !auto; setIb(autoBtn, "book", auto ? "Auto-turn" : "Turn by hand", 20); };
        win.cleanup.push(() => { clearTimeout(timer); clearTimeout(sleepTimer); SFX.duck(false); SFX.stopAmb(); });
        setTimeout(render, 450);
      }
    });
  }
  window.openStory = openStory;
})();
