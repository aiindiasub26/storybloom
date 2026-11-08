/* Make Together: hands-on parent + child activities for apartment life in Dubai. */
(function () {
  const BG = ["#fde2e0", "#fff3c4", "#d7efe0", "#d9ecfb", "#ece2fb", "#fde7d0"];
  window.openMakeTogether = function () {
    openWin({
      title: "Make Together",
      build(body, win) {
        blobs(win.el, ["#f7cf4a", "#7cc28a", "#f29bb8"], 5);
        body.append(h("div", { class: "hand hint" }, "Indoor-friendly ideas for apartment life"));
        const cols = $("#stage").classList.contains("portrait") ? 3 : 4;
        pager(body, ACTIVITIES, cols * 2, (a, i) => h("button", { class: "pick", style: { background: BG[i % BG.length], transform: `rotate(${(i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.5)}deg)` }, onclick: () => openActivity(a) },
          h("div", { class: "tape " + ["", "blue", "pink"][i % 3], style: { top: "-10px", left: "50%", transform: "translateX(-50%) rotate(2deg)" } }),
          APP.done["act:" + a.id] ? h("div", { class: "stars done-tick" }, icon("check", 26)) : null,
          h("div", { class: "big-emo" }, pic(a.icon, 100)), h("div", { class: "t", style: { fontSize: "23px" } }, a.title),
          h("div", { class: "s" }, `${a.where} · ages ${a.age}`)), { cols });
      }
    });
  };

  function openActivity(a) {
    openWin({
      title: a.title,
      build(body, win) {
        blobs(win.el, ["#fff3c4", "#d9ecfb"], 3);
        const left = h("div", { style: { display: "flex", flexDirection: "column", gap: "18px" } },
          h("div", { style: { textAlign: "center" } }, pic(a.icon, 140)),
          h("div", { class: "note", style: { transform: "rotate(-1.5deg)" } },
            h("div", { class: "tape", style: { top: "-14px", left: "30px", transform: "rotate(-5deg)" } }),
            h("h3", {}, "You need"), h("ul", {}, a.need.map(n => h("li", {}, n)))),
          h("div", { class: "hand", style: { fontSize: "28px", display: "flex", gap: "18px", justifyContent: "center", flexWrap: "wrap" } },
            h("span", {}, "Where: " + a.where), h("span", {}, "Time: " + a.time), h("span", {}, "Ages " + a.age)));
        const right = h("div", { style: { display: "flex", flexDirection: "column" } },
          h("div", { class: "note", style: { transform: "rotate(.8deg)" } },
            h("div", { class: "tape pink", style: { top: "-14px", right: "40px", transform: "rotate(4deg)" } }),
            h("h3", {}, "Let's do it"), h("ol", {}, a.steps.map(s => h("li", {}, s)))),
          h("div", { class: "tipbox" }, "Reading tip: " + a.tip));
        body.append(h("div", { class: "act" }, left, right),
          h("div", { class: "pager" },
            h("button", { class: "pbtn white", onclick: () => printActivity(a) }, ib("print", "Print card")),
            h("button", { class: "pbtn green", onclick: () => celebrate("act:" + a.id, { msg: "We did it!" }) }, ib("party", "We did it!"))));
      }
    });
  }

  window.activitySheet = a => ([`<div class="sheet" style="padding:10mm;font-family:Andika,sans-serif">
      <div>${picHTML(a.icon, 32)}</div>
      <h1 style="font-family:Fredoka;margin:4px 0">${a.title}</h1>
      <p style="font-size:16px">Where: ${a.where} &nbsp;·&nbsp; Time: ${a.time} &nbsp;·&nbsp; Ages ${a.age}</p>
      <h2>You need</h2><ul style="font-size:18px;line-height:1.6">${a.need.map(n => `<li>${n}</li>`).join("")}</ul>
      <h2>Steps</h2><ol style="font-size:18px;line-height:1.6">${a.steps.map(n => `<li>${n}</li>`).join("")}</ol>
      <p style="font-size:18px;border:2px dashed #999;padding:10px;border-radius:10px">Reading tip: ${a.tip}</p>
      <p style="margin-top:20mm;font-size:16px">We did it on: ____________ &nbsp; ☆ ☆ ☆</p></div>`]);
  function printActivity(a) { printSheets(activitySheet(a), { file: "activity-cards.pdf", page: ACTIVITIES.indexOf(a) + 1 }); }
})();
