/* The full stop of the big "unscrolled." pops out as a ball when the page starts scrolling.
   It bounces calmly off the screen edges and the page's cards and buttons, picks up energy
   from scrolling, settles when scrolling stops, can be flicked, and flies back into the word
   when you return to the top. A cat on a window sill at the bottom of the screen watches it,
   swats it when it comes within reach, and naps when everything is still.
   Nothing moves for people who ask for reduced motion. */
(function () {
  "use strict";
  var word = document.querySelector(".word"), stop = word && word.querySelector(".stop");
  if (!stop || !window.requestAnimationFrame) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var OBSTACLES = ".hero .btn, .feature, .ask";
  var G = 1500;          // gravity, px/s²
  var BOUNCE = 0.62;     // energy kept on an edge
  var BOUNCE_OBJ = 0.7;  // energy kept off a card or button
  var DRAG = 0.35;       // air resistance per second
  var MAX_V = 2200;

  var ball = document.createElement("div"); ball.className = "ball"; ball.setAttribute("aria-hidden", "true");
  var grip = document.createElement("div"); grip.className = "ball-grip"; grip.setAttribute("aria-hidden", "true");
  document.body.appendChild(ball); document.body.appendChild(grip);
  var base = document.createElement("i"); base.className = "base"; stop.appendChild(base); // marks the baseline

  var state = "home", p = { x: 0, y: 0 }, v = { x: 0, y: 0 }, d = 0, dTarget = 0, ink = null;
  var raf = 0, last = 0, lastScroll = scrollY, scrollKick = 0, topTimer = 0, flight = null, ghost = false, drag = null;

  // Where the full stop's ink sits inside the word, measured from the actual glyph.
  function measure() {
    var fs = parseFloat(getComputedStyle(word).fontSize);
    var c = document.createElement("canvas").getContext("2d");
    c.font = "400 " + fs + 'px Caslon, "Libre Caslon Text", Georgia, serif';
    var m = c.measureText("."), l = -m.actualBoundingBoxLeft, r = m.actualBoundingBoxRight;
    var a = m.actualBoundingBoxAscent, de = m.actualBoundingBoxDescent;
    ink = { cx: (l + r) / 2, cy: -(a - de) / 2, d: Math.max(r - l, a + de) + fs * 0.012 };
  }
  function homeSpot() {
    var s = stop.getBoundingClientRect(), b = base.getBoundingClientRect();
    return { x: s.left + ink.cx, y: b.top + ink.cy, d: ink.d };
  }
  var cat = document.getElementById("cat");
  var pupils = cat && cat.querySelector(".pupils");
  // the ball is a toy-ball size for the cat: about a third of its height
  var freeSize = function (dd) { return cat && cat.offsetHeight ? Math.round(cat.offsetHeight * 0.34) : Math.min(84, Math.max(44, dd * 2)); };
  // the cat's shapes on screen (its drawing is 120 x 140 units)
  function catGeom() {
    if (!cat || !cat.offsetHeight) return null;
    var R = cat.getBoundingClientRect(), k = R.height / 140, X = function (x) { return R.left + x * k; }, Y = function (y) { return R.top + y * k; };
    return {
      k: k,
      head: { x: X(60), y: Y(44), r: 26 * k },
      eyes: { x: X(60), y: Y(46) },
      shoulder: { x: X(50), y: Y(86) },
      body: { left: X(32), right: X(88), top: Y(70), bottom: Y(118), width: 1 },
      sill: { left: X(-40), right: document.documentElement.clientWidth, top: Y(118), bottom: Y(126), width: 1 }
    };
  }

  function draw() {
    var r = d / 2;
    ball.style.width = ball.style.height = d + "px";
    ball.style.transform = "translate(" + (p.x - r) + "px," + (p.y - r) + "px)";
    var g = Math.max(48, d + 12);
    grip.style.width = grip.style.height = g + "px";
    grip.style.transform = "translate(" + (p.x - g / 2) + "px," + (p.y - g / 2) + "px)";
    grip.style.pointerEvents = ghost ? "none" : "auto";
  }
  function bounds() {
    var bar = document.querySelector(".bar");
    return { top: bar ? bar.getBoundingClientRect().bottom : 0, bottom: innerHeight, left: 0, right: document.documentElement.clientWidth };
  }

  function detach(withPop) {
    if (!ink) measure();
    var h = homeSpot();
    p = { x: h.x, y: h.y }; d = h.d; dTarget = freeSize(h.d);
    v = withPop ? { x: (Math.random() < 0.5 ? -1 : 1) * (160 + Math.random() * 160), y: -560 } : { x: 0, y: 0 };
    state = "free"; flight = null;
    stop.classList.add("gone"); ball.style.display = "block"; grip.style.display = "block";
    catAwake(); draw(); wake();
  }
  function goHome() {
    if (state !== "free") return;
    state = "flying"; flight = { t: 0, from: { x: p.x, y: p.y }, d0: d };
    grip.style.display = "none"; wake();
  }
  function landHome() {
    state = "home"; flight = null;
    ball.style.display = "none"; grip.style.display = "none";
    stop.classList.remove("gone");
    stop.classList.remove("plop"); void stop.offsetWidth; stop.classList.add("plop");
    lookAt(homeSpot()); napSoon();
  }

  function wake() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }

  var prevRects = [];
  function frame(now) {
    raf = 0;
    var dt = Math.min(0.033, (now - last) / 1000) || 0.016; last = now;
    var sy = scrollY, scrolled = sy - lastScroll; lastScroll = sy;

    if (state === "flying") {
      flight.t = Math.min(1, flight.t + dt / 0.7);
      var t = flight.t, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, h = homeSpot();
      p.x = flight.from.x + (h.x - flight.from.x) * e;
      p.y = flight.from.y + (h.y - flight.from.y) * e - Math.sin(Math.PI * t) * 90;
      d = flight.d0 + (h.d - flight.d0) * e;
      draw(); lookAt(p);
      if (t >= 1) return landHome();
      raf = requestAnimationFrame(frame); return;
    }
    if (state === "drag") { d += (dTarget - d) * Math.min(1, dt * 8); draw(); lookAt(p); raf = requestAnimationFrame(frame); return; }
    if (state !== "free") return;

    d += (dTarget - d) * Math.min(1, dt * 8);
    var r = d / 2, B = bounds();
    // scrolling hands the ball some energy
    if (scrollKick) { v.y -= Math.max(-70, Math.min(70, scrollKick)) * 3; v.x += (Math.random() - 0.5) * Math.min(70, Math.abs(scrollKick)) * 6; scrollKick = 0; }
    v.y += G * dt;
    var k = Math.max(0, 1 - DRAG * dt); v.x *= k; v.y *= k;
    var sp = Math.hypot(v.x, v.y); if (sp > MAX_V) { v.x *= MAX_V / sp; v.y *= MAX_V / sp; }

    var els = document.querySelectorAll(OBSTACLES), rects = [];
    for (var i = 0; i < els.length; i++) rects.push(els[i].getBoundingClientRect());
    var C = catGeom();
    if (C) { rects.push(C.sill); rects.push(C.body); }
    var rv = dt > 0 ? -scrolled / dt : 0; // the page's cards move as it scrolls, and push the ball
    ghost = false;
    var STEPS = 3;
    for (var s = 0; s < STEPS; s++) {
      p.x += v.x * dt / STEPS; p.y += v.y * dt / STEPS;
      // screen edges
      if (p.y + r > B.bottom) { p.y = B.bottom - r; if (v.y > 0) v.y = -v.y * BOUNCE; if (Math.abs(v.y) < 45) v.y = 0; v.x *= Math.max(0, 1 - 2.5 * dt / STEPS); }
      if (p.y - r < B.top) { p.y = B.top + r; if (v.y < 0) v.y = -v.y * BOUNCE; }
      if (p.x - r < B.left) { p.x = B.left + r; if (v.x < 0) v.x = -v.x * BOUNCE; }
      if (p.x + r > B.right) { p.x = B.right - r; if (v.x > 0) v.x = -v.x * BOUNCE; }
      // cards and buttons
      for (var j = 0; j < rects.length; j++) {
        var R = rects[j];
        if (R.bottom < B.top || R.top > B.bottom || R.width === 0) continue;
        var qx = Math.max(R.left, Math.min(p.x, R.right)), qy = Math.max(R.top, Math.min(p.y, R.bottom));
        var dx = p.x - qx, dy = p.y - qy, dist = Math.hypot(dx, dy);
        if (dist >= r) continue;
        if (dist === 0) { ghost = true; continue; } // inside a card: slide behind it
        var nx = dx / dist, ny = dy / dist, push = r - dist;
        var npx = p.x + nx * push, npy = p.y + ny * push;
        if (npy - r < B.top - 1 || npy + r > B.bottom + 1 || npx - r < B.left - 1 || npx + r > B.right + 1) { ghost = true; continue; } // trapped: pass behind
        p.x = npx; p.y = npy;
        var relx = v.x, rely = v.y - rv, vn = relx * nx + rely * ny;
        if (vn < 0) { relx -= (1 + BOUNCE_OBJ) * vn * nx; rely -= (1 + BOUNCE_OBJ) * vn * ny; v.x = relx; v.y = rely + rv; }
      }
      // the cat's head is round
      if (C) {
        var hx = p.x - C.head.x, hy = p.y - C.head.y, hd = Math.hypot(hx, hy), need = r + C.head.r;
        if (hd < need && hd > 0) {
          var ux = hx / hd, uy = hy / hd; p.x = C.head.x + ux * need; p.y = C.head.y + uy * need;
          var vh = v.x * ux + v.y * uy; if (vh < 0) { v.x -= (1 + BOUNCE_OBJ) * vh * ux; v.y -= (1 + BOUNCE_OBJ) * vh * uy; }
        }
      }
    }
    draw();
    var inReach = catThink(now, C, r);
    var resting = p.y + r >= B.bottom - 0.5 && Math.abs(v.y) < 1 && Math.abs(v.x) < 6;
    if (resting && !scrolled && !inReach) { v.x = 0; return; } // rest until something happens
    raf = requestAnimationFrame(frame);
  }

  /* ---------- the cat ---------- */
  var swatAt = 0, swatReady = 0, napTimer = 0;
  function lookAt(pt) {
    var C = catGeom(); if (!C || !pupils || !pt) return;
    var dx = pt.x - C.eyes.x, dy = pt.y - C.eyes.y, L = Math.hypot(dx, dy) || 1;
    pupils.setAttribute("transform", "translate(" + (dx / L * 2.4).toFixed(2) + " " + (dy / L * 1.6).toFixed(2) + ")");
  }
  function catAwake() { if (!cat) return; clearTimeout(napTimer); if (cat.classList.contains("sleep")) { cat.classList.remove("sleep"); blink(); } }
  function napSoon() { if (!cat) return; clearTimeout(napTimer); napTimer = setTimeout(function () { if (state === "home") cat.classList.add("sleep"); }, 5000); }
  function blink(ms) { if (!cat || cat.classList.contains("sleep")) return; cat.classList.add("blink"); setTimeout(function () { cat.classList.remove("blink"); }, ms || 150); }
  // Watches the ball; when it comes within reach, waits a beat, then swats it away.
  function catThink(now, C, r) {
    if (!C) return false;
    lookAt(p);
    var near = Math.hypot(p.x - C.head.x, p.y - C.head.y);
    cat.classList.toggle("alert", near < 320);
    var reach = 66 * C.k + r, toPaw = Math.hypot(p.x - C.shoulder.x, p.y - C.shoulder.y);
    var inReach = toPaw < reach && state === "free";
    if (!inReach) { swatAt = 0; return false; }
    if (now < swatReady) return true;
    if (!swatAt) { swatAt = now + 200 + Math.random() * 380; return true; }   // a cat's pause
    if (now < swatAt) return true;
    // swat: paw swings toward the ball, the ball flies away from the cat and up
    var ax = p.x - C.shoulder.x, ay = p.y - C.shoulder.y, L = Math.hypot(ax, ay) || 1;
    var deg = (Math.atan2(ay, ax) - Math.PI / 2) * 180 / Math.PI; if (deg > 180) deg -= 360; if (deg < -180) deg += 360;
    cat.style.setProperty("--swat", Math.max(-150, Math.min(150, deg)).toFixed(0) + "deg");
    cat.classList.add("swat"); setTimeout(function () { cat.classList.remove("swat"); }, 230);
    var power = 520 + Math.random() * 260;
    v.x = ax / L * power; v.y = ay / L * power - 420;
    if (v.x > -120 && C.head.x > innerWidth / 2) v.x = -(260 + Math.random() * 200); // send it back into the room
    swatAt = 0; swatReady = now + 900;
    return false;
  }
  if (cat) {
    // blink now and then; a tap on the cat gets a slow blink back
    (function idleBlink() { setTimeout(function () { blink(); idleBlink(); }, 3200 + Math.random() * 3800); })();
    cat.addEventListener("pointerdown", function () { catAwake(); blink(650); });
  }

  addEventListener("scroll", function () {
    var dy = scrollY - lastScroll;
    if (state === "home" && scrollY > 40) { lastScroll = scrollY; return detach(true); }
    if (state === "flying" && scrollY > 40) { state = "free"; flight = null; grip.style.display = "block"; dTarget = freeSize(ink.d); v = { x: 0, y: 0 }; }
    if (state === "free") { scrollKick += dy; wake(); }
    clearTimeout(topTimer);
    if (scrollY <= 30 && state === "free") topTimer = setTimeout(function () { if (scrollY <= 30) goHome(); }, 280);
  }, { passive: true });

  addEventListener("resize", function () { if (ink) measure(); if (state === "free") { dTarget = freeSize(ink.d); wake(); } });

  // flick or tap the ball
  var samples = [];
  grip.addEventListener("pointerdown", function (e) {
    if (state !== "free") return;
    e.preventDefault(); grip.setPointerCapture(e.pointerId);
    state = "drag"; drag = { x0: e.clientX, y0: e.clientY, t0: performance.now(), ox: p.x - e.clientX, oy: p.y - e.clientY };
    samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }]; grip.style.cursor = "grabbing"; wake();
  });
  grip.addEventListener("pointermove", function (e) {
    if (state !== "drag") return;
    var B = bounds(), r = d / 2;
    p.x = Math.max(B.left + r, Math.min(B.right - r, e.clientX + drag.ox));
    p.y = Math.max(B.top + r, Math.min(B.bottom - r, e.clientY + drag.oy));
    samples.push({ x: e.clientX, y: e.clientY, t: performance.now() }); if (samples.length > 6) samples.shift();
  });
  function release(e) {
    if (state !== "drag") return;
    state = "free"; grip.style.cursor = "";
    var a = samples[0], b = samples[samples.length - 1], dt = Math.max(16, b.t - a.t) / 1000;
    var moved = Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0);
    if (moved < 6 && performance.now() - drag.t0 < 300) { v = { x: (Math.random() - 0.5) * 200, y: -650 }; } // tap: a little hop
    else { v = { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt }; }
    var sp = Math.hypot(v.x, v.y); if (sp > MAX_V) { v.x *= MAX_V / sp; v.y *= MAX_V / sp; }
    wake();
  }
  grip.addEventListener("pointerup", release);
  grip.addEventListener("pointercancel", release);

  var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.then(function () { measure(); if (scrollY > 40) detach(false); else { lookAt(homeSpot()); napSoon(); } });
})();
