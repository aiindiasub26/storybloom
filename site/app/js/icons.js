/* Hand-drawn pencil icons for buttons (replaces emoji). icon(name, size) -> SVG element. */
(function () {
  const P = {
    back: '<path d="M20 12H5M11 5l-7 7 7 7"/>',
    play: '<path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" fill-opacity=".9"/>',
    pause: '<path d="M7 4.5v15M16 4.5v15" stroke-width="3.6"/>',
    prev: '<path d="M18 5l-9 7 9 7zM6 5v14" fill="currentColor" fill-opacity=".9"/>',
    next: '<path d="M6 5l9 7-9 7zM18 5v14" fill="currentColor" fill-opacity=".9"/>',
    left: '<path d="M15 4l-8 8 8 8"/>',
    right: '<path d="M9 4l8 8-8 8"/>',
    speaker: '<path d="M4 9.5h3.5L13 5v14l-5.5-4.5H4z" fill="currentColor" fill-opacity=".15"/><path d="M16 9c1.3 1.6 1.3 4.4 0 6M18.7 6.5c2.6 3 2.6 8 0 11"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" fill-opacity=".15"/><path d="M6 11a6 6 0 0012 0M12 17v4M8.5 21h7"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" fill-opacity=".85"/>',
    print: '<path d="M7 9V3.5h10V9"/><rect x="3.5" y="9" width="17" height="8" rx="2" fill="currentColor" fill-opacity=".12"/><path d="M7 14h10v6.5H7z" fill="#fff"/><path d="M9.5 17h5"/>',
    pdf: '<path d="M6 2.5h8l4.5 4.5v14.5H6z" fill="currentColor" fill-opacity=".1"/><path d="M14 2.5V7h4.5M9 12h6M9 15.5h6M9 19h3.5"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1-4.4-4.3 6.1-.8z" fill="currentColor" fill-opacity=".9"/>',
    moon: '<path d="M19 15.5A8 8 0 018.5 5a8 8 0 1010.5 10.5z" fill="currentColor" fill-opacity=".2"/>',
    music: '<path d="M9 18V5.5l11-2.5v12.5"/><circle cx="6.5" cy="18" r="2.6" fill="currentColor"/><circle cx="17.5" cy="15.5" r="2.6" fill="currentColor"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z" fill="currentColor" fill-opacity=".15"/><path d="M10 21h4"/>',
    belloff: '<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z" fill="currentColor" fill-opacity=".08"/><path d="M10 21h4M3.5 3.5l17 17"/>',
    leaf: '<path d="M5 19C5 9 11 4.5 20 4c-.5 9-5 15-15 15z" fill="currentColor" fill-opacity=".18"/><path d="M5 19l9-9"/>',
    leafoff: '<path d="M5 19C5 9 11 4.5 20 4c-.5 9-5 15-15 15z" fill="currentColor" fill-opacity=".06"/><path d="M3.5 3.5l17 17"/>',
    sleep: '<path d="M4 6h5l-5 6h5M12 3.5h4l-4 4.5h4M13 13h7l-7 8h7"/>',
    again: '<path d="M19.5 12a7.5 7.5 0 11-2.4-5.5"/><path d="M19.5 3.5v4.5H15"/>',
    check: '<path d="M4.5 12.5l5 5 10-11"/>',
    gear: '<circle cx="12" cy="12" r="3.3"/><path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M5.5 18.5l2.1-2.1M16.4 7.6l2.1-2.1"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2" fill="currentColor" fill-opacity=".15"/><path d="M8 10.5V7.5a4 4 0 018 0v3"/>',
    eraser: '<path d="M14.5 4.5l5 5-9 9h-5l-2.5-2.5z" fill="currentColor" fill-opacity=".15"/><path d="M9 10l5 5M12 20.5h8"/>',
    undo: '<path d="M8.5 6.5L4 11l4.5 4.5"/><path d="M4 11h10a5.5 5.5 0 010 11h-3"/>',
    save: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 19.5h15"/>',
    party: '<path d="M4 20l4.5-12 7.5 7.5z" fill="currentColor" fill-opacity=".2"/><path d="M14 4.5l.6 2M19 6l-2 1.3M19.5 11l-2-.3M12 8.5l2-2"/>',
    dance: '<circle cx="13" cy="4.5" r="2"/><path d="M12.5 7.5l-1 6 3.5 3 .5 4.5M11.5 13.5L7 17M12 9l-5-1.5M12.5 9l5 2.5"/>',
    blend: '<path d="M12 12m-1.5 0a1.5 1.5 0 103 0 4 4 0 10-8 0 6.5 6.5 0 1013 0 9 9 0 10-18 0"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0112 7.3 4.3 4.3 0 0119.5 10c0 5.4-7.5 10-7.5 10z" fill="currentColor" fill-opacity=".85"/>',
    book: '<path d="M3.5 5.5c3-1 6-1 8.5 1v13c-2.5-2-5.5-2-8.5-1zM20.5 5.5c-3-1-6-1-8.5 1v13c2.5-2 5.5-2 8.5-1z" fill="currentColor" fill-opacity=".12"/>',
    ear: '<path d="M7 9a5 5 0 0110 0c0 3-3 4-3 7a3 3 0 01-6 0"/><path d="M10 9.5a2 2 0 014 0c0 1.5-1.5 2-1.5 3"/>',
    parrot: '<path d="M9 13c-3-1-4-5-1-8 3-2.5 7-1 8 2l3 1-3 1c0 5-4 8-8 9l1-5"/><circle cx="12.5" cy="7.3" r="1" fill="currentColor"/>'
  };
  window.icon = function (name, size = 30, extra = "") {
    const span = document.createElement("span");
    span.className = "ico";
    span.innerHTML = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${extra}><g filter="url(#pencil-sm)">${P[name] || ""}</g></svg>`;
    return span;
  };
  window.ICON_NAMES = Object.keys(P);
})();
/* Illustrated stickers (replace emoji pictures). */
window.pic = function (name, size = 80, cls = "") {
  const im = document.createElement("img");
  im.className = "stk " + cls; im.alt = ""; im.src = `assets/img/stickers/${name}.webp`;
  im.style.width = im.style.height = size + "px"; return im;
};
window.picHTML = (name, mm = 30) => `<img class="pic-ink" src="assets/img/stickers/${name}.webp" style="width:${mm}mm;height:${mm}mm;object-fit:contain">`;
// button content: icon + optional label
window.ib = function (name, label, size = 26) {
  const f = document.createDocumentFragment(); f.append(icon(name, size));
  if (label) { const t = document.createElement("span"); t.className = "ib-label"; t.textContent = label; f.append(t); }
  return f;
};
window.setIb = (btn, name, label, size) => { btn.innerHTML = ""; btn.append(ib(name, label, size)); };
window.starRow = n => { const sp = document.createElement("span"); sp.className = "star-row"; for (let i = 0; i < n; i++) sp.append(icon("star", 20)); return sp; };
