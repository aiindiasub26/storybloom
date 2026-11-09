/* Sing Along: original and classic songs with read-along lyrics. */
(function () {
  const INFO = {
    "jungle-groove": { t: "Jungle Groove", c: "#7cc28a", kind: "Dance" },
    "head-shoulders": { t: "Head, Shoulders, Knees and Toes", c: "#ef6f61", kind: "Dance" },
    "if-youre-happy": { t: "If You're Happy and You Know It", c: "#f6a04d", kind: "Dance" },
    "camel-shuffle": { t: "Camel Shuffle", c: "#f6a04d", kind: "Dance" },
    "under-the-sea": { t: "Swim With Me", c: "#4fb7b3", kind: "Dance" },
    "sight-word-shake": { t: "Sight Word Shake", c: "#f29bb8", kind: "Learn" },
    "rainbow-colours": { t: "Rainbow Colours", c: "#9b7fd1", kind: "Learn" },
    "count-with-me": { t: "Count With Me", c: "#e8a917", kind: "Learn" },
    "five-monkeys": { t: "Five Little Monkeys", c: "#5b9bd5", kind: "Rhyme" },
    "wheels-on-the-bus": { t: "The Wheels on the Bus", c: "#5b9bd5", kind: "Rhyme" },
    "old-macdonald": { t: "Old MacDonald", c: "#5b9bd5", kind: "Rhyme" },
    "itsy-bitsy": { t: "Itsy Bitsy Spider", c: "#5b9bd5", kind: "Rhyme" },
    "row-your-boat": { t: "Row, Row, Row Your Boat", c: "#5b9bd5", kind: "Rhyme" },
    "five-ducks": { t: "Five Little Ducks", c: "#5b9bd5", kind: "Rhyme" },
    "baa-baa": { t: "Baa, Baa, Black Sheep", c: "#5b9bd5", kind: "Rhyme" },
    "humpty-dumpty": { t: "Humpty Dumpty", c: "#5b9bd5", kind: "Rhyme" },
    "hickory-dickory": { t: "Hickory Dickory Dock", c: "#5b9bd5", kind: "Rhyme" },
    "mary-lamb": { t: "Mary Had a Little Lamb", c: "#5b9bd5", kind: "Rhyme" },
    "twinkle-star": { t: "Twinkle, Twinkle, Little Star", c: "#2c3470", kind: "Bedtime" },
    "bedtime-routine": { t: "Brush, Bath, Book, Bed", c: "#9b7fd1", kind: "Bedtime" }
  };
  const list = () => Object.keys(INFO).filter(k => window.SONGS && SONGS[k]);
  let audio = null;
  const stopSong = () => { if (audio) { audio.pause(); audio = null; } };

  window.openSongs = function () {
    openWin({
      title: "Sing Along",
      build(body, win) {
        blobs(win.el, ["#7cc28a", "#f7cf4a", "#f29bb8"], 5);
        body.append(h("div", { class: "hand hint" }, "Sing, dance and read the words"));
        const cols = $("#stage").classList.contains("portrait") ? 2 : 5;
        pager(body, list(), cols * 2, (k, i) => {
          const s = INFO[k];
          return h("button", { class: "pick", style: { padding: 0, justifyContent: "flex-end", transform: `rotate(${(i % 2 ? 1 : -1) * (.6 + (i % 3) * .4)}deg)` }, onclick: () => openSong(k) },
            h("img", { src: `assets/img/songs/${k}.webp`, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } }),
            h("div", { style: { position: "absolute", top: "8px", left: "8px", background: s.c, color: "#fff", border: "2px solid #2f2a3b", borderRadius: "20px", padding: "2px 10px", fontWeight: 700, fontSize: "15px" } }, s.kind),
            h("div", { style: { position: "relative", background: "rgba(255,253,244,.95)", width: "100%", padding: "8px", borderTop: "3px solid #2f2a3b" } },
              h("div", { class: "t", style: { fontSize: "19px" } }, s.t)));
        }, { cols });
      }
    });
  };

  function openSong(k) {
    const ids = list(); let idx = ids.indexOf(k);
    openWin({
      title: "Sing Along",
      build(body, win) {
        const night = INFO[k].kind === "Bedtime";
        const cover = h("img", { style: { width: "100%", height: "100%", objectFit: "cover" } });
        const pic = h("div", { class: "pic song-cover" }, cover);
        const title = h("div", { class: "t", style: { fontSize: "34px", fontWeight: 700, fontFamily: "var(--ui)" } });
        const section = h("div", { class: "hand", style: { fontSize: "28px", opacity: .75 } });
        const lyrics = h("div", { class: "lyrics" });
        const bar = h("div", { class: "song-bar" }, h("i"));
        const time = h("div", { class: "hand", style: { fontSize: "24px", minWidth: "120px", textAlign: "right" } });
        const play = h("button", { class: "arrow", style: { width: "96px", height: "96px", background: "#f7cf4a" }, "aria-label": "Play or pause" }, icon("play", 46));
        const prev = h("button", { class: "arrow", "aria-label": "Previous song" }, icon("prev", 32)), next = h("button", { class: "arrow", "aria-label": "Next song" }, icon("next", 32));
        const dance = h("button", { class: "pbtn small pink" }, ib("dance", "Dance mode", 22));
        const side = h("div", { class: "song-side" }, title, section, lyrics,
          h("div", { style: { display: "flex", alignItems: "center", gap: "14px", width: "100%" } }, bar, time),
          h("div", { style: { display: "flex", alignItems: "center", gap: "16px", justifyContent: "center" } }, prev, play, next, dance));
        body.append(h("div", { class: "book song-layout" }, pic, side));
        let lines = [], curLine = -1, raf = 0;

        function load(autoplay) {
          stopSong(); cancelAnimationFrame(raf);
          k = ids[idx]; const s = INFO[k];
          cover.src = `assets/img/songs/${k}.webp`;
          title.textContent = s.t;
          // build a timeline: each lyric line gets an even share of its section
          lines = []; let t = 0;
          SONGS[k].forEach(sec => {
            const n = sec.lines.length;
            sec.lines.forEach((ln, j) => lines.push({ t: t + (sec.ms / Math.max(n, 1)) * j, text: ln, sec: sec.name, secStart: t, secEnd: t + sec.ms }));
            if (!n) lines.push({ t, text: "", sec: sec.name, secStart: t, secEnd: t + sec.ms, music: true });
            t += sec.ms;
          });
          curLine = -1; render(0);
          audio = new Audio(`assets/audio/songs/${k}.mp3`);
          audio.onended = () => { setIb(play, "play", "", 46); if (!win.closed) { idx = (idx + 1) % ids.length; load(true); } };
          audio.onplay = () => { setIb(play, "pause", "", 46); tick(); };
          audio.onpause = () => { setIb(play, "play", "", 46); };
          if (autoplay) audio.play().catch(() => {});
          win.el.classList.toggle("night", s.kind === "Bedtime");
        }
        function render(i) {
          const L = lines[i] || lines[0]; if (!L) return;
          section.textContent = L.music ? "music…" : L.sec;
          const secLines = lines.filter(x => x.secStart === L.secStart && !x.music);
          lyrics.innerHTML = "";
          secLines.forEach(x => {
            const row = h("div", { class: "lyric" + (x === L ? " on" : "") });
            wordSpans(x.text).forEach(sp => { row.append(sp, " "); sp.addEventListener("click", e => { e.stopPropagation(); SFX.play("tap"); }); });
            lyrics.append(row);
          });
          lyrics.classList.toggle("many", secLines.length > 6);
        }
        function tick() {
          if (!audio || audio.paused) return;
          const ms = audio.currentTime * 1000;
          let i = 0; for (let j = 0; j < lines.length; j++) if (lines[j].t <= ms) i = j;
          if (i !== curLine) { curLine = i; render(i); }
          const d = audio.duration || 1;
          bar.firstChild.style.width = (audio.currentTime / d * 100) + "%";
          const f = s => Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0");
          time.textContent = f(audio.currentTime) + " / " + f(d);
          raf = requestAnimationFrame(tick);
        }
        play.onclick = () => { if (!audio) return; audio.paused ? audio.play() : audio.pause(); };
        prev.onclick = () => { idx = (idx - 1 + ids.length) % ids.length; load(true); };
        next.onclick = () => { idx = (idx + 1) % ids.length; load(true); };
        bar.onclick = e => { if (!audio || !audio.duration) return; const r = bar.getBoundingClientRect(); audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; curLine = -1; tick(); };
        dance.onclick = () => { pic.classList.toggle("dancing"); setIb(dance, "dance", pic.classList.contains("dancing") ? "Stop dancing" : "Dance mode", 22); };
        win.cleanup.push(() => { stopSong(); cancelAnimationFrame(raf); if (!APP.done["song:" + k]) award("song:" + k); });
        load(false);
      }
    });
  }
  window.stopSong = stopSong;
})();
