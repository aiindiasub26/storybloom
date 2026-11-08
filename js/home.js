/* Home screen, sticker book, grown-ups corner. */
(function () {
  const stage = $("#stage");

  function buildHome() {
    const old = $("#home"); if (old) old.remove();
    const home = h("div", { id: "home", class: "screen grain" });
    blobs(home, ["#f7cf4a", "#9ccbf0", "#f29bb8", "#7cc28a", "#f6a04d"], 7);
    const hour = new Date().getHours();
    const greet = APP.name ? `Hello, ${APP.name}!` : hour >= 18 || hour < 5 ? "Good evening!" : "Hello, friend!";
    home.append(h("div", { class: "home-head" },
      h("div", {}, h("div", { class: "logo" }, cutout("StoryBloom", 54)), h("div", { class: "hand", style: { fontSize: "30px", marginLeft: "10px", marginTop: "2px" } }, greet + " ✿")),
      h("div", { class: "home-tools" },
        h("button", { class: "star-count", onclick: openStickers, title: "My Sticker Book" }, "⭐ " + APP.stars + " · Stickers"),
        h("button", { class: "icon-btn", title: "Grown-ups", onclick: openGrownups }, "⚙️"))));

    const tiles = h("div", { class: "tiles" });
    const T = [
      { cls: "big", img: "assets/img/home/hero.webp", title: "Learn to Read", sub: "Sounds · words · little books", emo: "📖", badge: "START HERE", fn: openLearn, bg: "#fff3c4" },
      { img: "assets/img/home/night.webp", title: "Bedtime Stories", sub: "20 stories with sounds", emo: "🌙", fn: openStories },
      { img: "assets/img/home/make.webp", title: "Make Together", sub: "16 hands-on ideas", emo: "✂️", fn: openMakeTogether },
      { img: "assets/img/home/print.webp", title: "Print Shop", sub: "Worksheets & colouring", emo: "🖨️", fn: openPrintShop },
      { img: "assets/img/songs/jungle-groove.webp", title: "Sing Along", sub: "10 songs to dance & read", emo: "🎵", fn: openSongs }
    ];
    T.forEach(t => {
      const tile = h("button", { class: "tile " + (t.cls || ""), onclick: () => { SFX.unlock(); t.fn(); } },
        h("div", { class: "card" }, h("img", { src: t.img, alt: "" }), h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(transparent 45%, rgba(251,246,236,.85))" } })),
        t.badge ? h("div", { class: "badge" }, t.badge) : null,
        h("div", { class: "emo" }, t.emo),
        h("div", { class: "label" }, cutout(t.title), h("div", { class: "sub" }, t.sub)));
      tiles.append(tile);
    });
    home.append(tiles);
    stage.prepend(home);
  }
  window.buildHome = buildHome;

  function openStickers() {
    openWin({
      title: "My Sticker Book",
      build(body, win) {
        blobs(win.el, ["#f29bb8", "#f7cf4a"], 4);
        const cols = $("#stage").classList.contains("portrait") ? 6 : 9;
        const grid = h("div", { class: "grid", style: { gridTemplateColumns: `repeat(${cols},1fr)`, gap: "12px", top: "10px" } });
        STICKERS.forEach((s, i) => {
          const got = i < APP.stickers.length;
          grid.append(h("div", { class: "pick", style: { aspectRatio: "1", padding: 0, background: got ? "#fff" : "#efe6d4", borderStyle: got ? "solid" : "dashed", transform: `rotate(${(Math.random() * 8 - 4).toFixed(1)}deg)` } },
            h("div", { style: { fontSize: "54px", filter: got ? "none" : "grayscale(1) opacity(.25)" } }, got ? APP.stickers[i] : "?")));
        });
        body.append(h("div", { class: "hand hint" }, `⭐ ${APP.stars} stars · ${APP.stickers.length} stickers`), grid);
      }
    });
  }
  window.openStickers = openStickers;

  // Grown-ups corner behind a simple parent gate (hold for 2 seconds).
  function openGrownups() {
    openWin({
      title: "Grown-ups",
      build(body) {
        const gate = h("div", { class: "center" }, h("div", { style: { fontSize: "80px" } }, "🔒"), h("div", { class: "hand", style: { fontSize: "36px" } }, "Grown-ups: press and hold the button"));
        const hold = h("button", { class: "pbtn orange", style: { fontSize: "30px", padding: "20px 40px" } }, "Hold me ✋");
        let t;
        hold.addEventListener("pointerdown", () => { hold.textContent = "Keep holding…"; t = setTimeout(show, 1800); });
        ["pointerup", "pointerleave"].forEach(e => hold.addEventListener(e, () => { clearTimeout(t); hold.textContent = "Hold me ✋"; }));
        gate.append(hold); body.append(gate);
        function show() {
          gate.remove();
          const S = APP.settings;
          const sw = (k, label) => { const b = h("button", { class: "switch" + (S[k] ? " on" : "") }); b.onclick = () => { S[k] = !S[k]; b.classList.toggle("on", S[k]); save(); if (k === "amb" && !S[k]) SFX.stopAmb(); }; return h("div", { class: "form-row" }, b, label); };
          const nameIn = h("input", { class: "name-in", value: APP.name || "", placeholder: "Child's name", maxlength: 12 });
          nameIn.addEventListener("pointerdown", e => e.stopPropagation());
          nameIn.onchange = () => { APP.name = nameIn.value.trim(); save(); buildHome(); };
          const left = h("div", { class: "note" }, h("h3", {}, "⚙️ Settings"),
            sw("sfx", "Sound effects"), sw("amb", "Background nature sounds in stories"),
            h("div", { class: "form-row" }, "Name: ", nameIn),
            h("div", { class: "form-row" }, h("button", { class: "pbtn small pink", onclick: () => { if (confirm("Reset all stars, stickers and progress?")) { APP.stars = 0; APP.stickers = []; APP.done = {}; save(); buildHome(); toast("Progress reset"); } } }, "Reset progress")));
          const done = APP.done;
          const count = p => Object.keys(done).filter(k => k.startsWith(p)).length;
          const right = h("div", { class: "note" }, h("h3", {}, "📈 Progress"),
            h("ul", {},
              h("li", {}, `Letters traced: ${count("letter:")} / 26`),
              h("li", {}, `Reading games played: ${count("game:")}`),
              h("li", {}, `Little Readers finished: ${count("reader:")} / ${READERS.length}`),
              h("li", {}, `Bedtime stories heard: ${count("story:")} / ${STORIES.length}`),
              h("li", {}, `Activities done together: ${count("act:")} / ${ACTIVITIES.length}`)),
            h("h3", { style: { marginTop: "14px" } }, "💡 Suggested path"),
            h("ul", {}, h("li", {}, "Age 3–4: ABC Sounds, Trace, First Sounds"), h("li", {}, "Age 4–5: Blender, Rhyme Time, Sight Set 1–2"), h("li", {}, "Age 5–6: Picture Match, Build-a-Word, Level 1 books"), h("li", {}, "Age 6–8: Sight Set 3–4, Level 2–3 books, Echo + I'll read")));
          body.append(h("div", { class: "act", style: { gridTemplateColumns: "1fr 1fr", bottom: "30px" } }, left, right));
        }
      }
    });
  }

  buildHome();
  window.addEventListener("stagefit", () => { /* layout is CSS driven; rebuild home on orientation change */ });
  let lastPortrait = stage.classList.contains("portrait");
  window.addEventListener("resize", () => { const p = stage.classList.contains("portrait"); if (p !== lastPortrait) { lastPortrait = p; buildHome(); } });
  setTimeout(() => { const s = $("#splash"); if (s) { s.style.opacity = 0; setTimeout(() => s.remove(), 500); } }, 900);
})();
