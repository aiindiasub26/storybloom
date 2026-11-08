/* StoryBloom sound engine: every sound effect and ambience is synthesised live with
   the Web Audio API, so it costs nothing, weighs nothing, and works fully offline. */
(function () {
  let ctx = null, master = null, sfxBus = null, ambBus = null, ambNodes = [], ambTimer = null;
  const vol = { sfx: 0.9, amb: 0.8 };

  function ac() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      sfxBus = ctx.createGain(); sfxBus.gain.value = vol.sfx; sfxBus.connect(master);
      ambBus = ctx.createGain(); ambBus.gain.value = vol.amb; ambBus.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const now = () => ac().currentTime;

  let noiseBuf = null;
  function noise() {
    if (!noiseBuf) {
      const c = ac(), len = c.sampleRate * 2;
      noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ac().createBufferSource(); s.buffer = noiseBuf; s.loop = true; return s;
  }
  function env(g, t, a, peak, d, end = 0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + d);
  }
  function tone(type, f, t, dur, peak = 0.3, out = sfxBus, f2 = null, a = 0.01) {
    const c = ac(), o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, a, peak, dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + a + dur + 0.05);
    return o;
  }
  function nz(t, dur, { type = "bandpass", f = 1000, q = 1, peak = 0.4, a = 0.005, f2 = null, out = sfxBus } = {}) {
    const c = ac(), s = noise(), fl = c.createBiquadFilter(), g = c.createGain();
    fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    env(g, t, a, peak, dur);
    s.connect(fl); fl.connect(g); g.connect(out); s.start(t); s.stop(t + a + dur + 0.05);
  }

  const FX = {
    sparkle(t) { [1568, 2093, 2637, 3136, 2349].forEach((f, i) => tone("sine", f, t + i * 0.07, 0.35, 0.12)); },
    magic(t) { for (let i = 0; i < 10; i++) tone("triangle", 600 * Math.pow(1.12, i), t + i * 0.05, 0.4, 0.09); nz(t, 0.9, { type: "highpass", f: 6000, peak: 0.05 }); },
    chime(t) { [1046, 1318, 1568].forEach((f, i) => tone("sine", f, t + i * 0.12, 1.2, 0.14)); },
    bell(t) { tone("sine", 1760, t, 1.2, 0.2); tone("sine", 2640, t, 0.8, 0.08); },
    ding(t) { tone("sine", 1318, t, 1.0, 0.22); tone("sine", 1046, t + 0.25, 1.2, 0.2); },
    pop(t) { tone("sine", 400, t, 0.12, 0.35, sfxBus, 1200); },
    plop(t) { tone("sine", 900, t, 0.18, 0.35, sfxBus, 180); },
    boing(t) { const o = tone("triangle", 180, t, 0.6, 0.3, sfxBus, 420); },
    whoosh(t) { nz(t, 0.7, { f: 300, f2: 3000, q: 2, peak: 0.35, a: 0.2 }); },
    wind(t) { nz(t, 2.6, { type: "lowpass", f: 300, f2: 900, q: 6, peak: 0.25, a: 0.9 }); nz(t + 0.8, 2.0, { type: "lowpass", f: 700, f2: 250, q: 8, peak: 0.18, a: 0.6 }); },
    rain(t) { nz(t, 4, { type: "highpass", f: 2500, peak: 0.12, a: 0.6 }); for (let i = 0; i < 40; i++) tone("sine", 2500 + Math.random() * 2500, t + Math.random() * 4, 0.03, 0.04); },
    splash(t) { nz(t, 0.6, { f: 1200, f2: 400, q: 0.8, peak: 0.5 }); for (let i = 0; i < 6; i++) tone("sine", 800 + Math.random() * 900, t + 0.1 + Math.random() * 0.4, 0.06, 0.06, sfxBus, 1800); },
    bubble(t) { for (let i = 0; i < 8; i++) tone("sine", 300 + Math.random() * 200, t + i * 0.12, 0.08, 0.15, sfxBus, 900); },
    knock(t) { [0, 0.22].forEach(d => { tone("sine", 160, t + d, 0.12, 0.6, sfxBus, 90); nz(t + d, 0.05, { f: 900, peak: 0.3 }); }); },
    hammer(t) { [0, 0.3, 0.6].forEach(d => { tone("square", 220, t + d, 0.06, 0.12, sfxBus, 110); nz(t + d, 0.08, { f: 2000, peak: 0.3 }); }); },
    blocks(t) { [0, 0.18, 0.4].forEach(d => tone("square", 700 + Math.random() * 300, t + d, 0.05, 0.08)); },
    crash(t) { nz(t, 0.9, { type: "lowpass", f: 3000, f2: 200, peak: 0.6 }); for (let i = 0; i < 8; i++) tone("square", 300 + Math.random() * 600, t + Math.random() * 0.5, 0.06, 0.07); },
    snap(t) { nz(t, 0.08, { type: "highpass", f: 2000, peak: 0.7 }); },
    thud(t) { tone("sine", 120, t, 0.3, 0.6, sfxBus, 50); nz(t, 0.15, { type: "lowpass", f: 400, peak: 0.3 }); },
    stomp(t) { [0, 0.35, 0.7].forEach(d => { tone("sine", 90, t + d, 0.25, 0.7, sfxBus, 45); }); },
    footsteps(t) { for (let i = 0; i < 6; i++) nz(t + i * 0.28, 0.09, { type: "lowpass", f: 700, peak: 0.35 }); },
    hooves(t) { for (let i = 0; i < 8; i++) { tone("sine", i % 2 ? 520 : 440, t + i * 0.2, 0.06, 0.2, sfxBus, 250); } },
    flap(t) { for (let i = 0; i < 4; i++) nz(t + i * 0.18, 0.12, { f: 500, q: 0.7, peak: 0.35, a: 0.03 }); },
    snip(t) { [0, 0.2].forEach(d => nz(t + d, 0.05, { type: "highpass", f: 4000, peak: 0.4 })); },
    crinkle(t) { for (let i = 0; i < 18; i++) nz(t + Math.random() * 0.8, 0.02, { type: "highpass", f: 3000 + Math.random() * 3000, peak: 0.25 }); },
    huff(t) { [0, 0.6].forEach(d => nz(t + d, 0.5, { f: 600, q: 0.6, peak: 0.6, a: 0.05 })); nz(t + 1.2, 1.4, { type: "lowpass", f: 1500, f2: 300, peak: 0.7, a: 0.1 }); },
    gasp(t) { nz(t, 0.35, { f: 1800, q: 3, peak: 0.25, a: 0.08 }); },
    munch(t) { for (let i = 0; i < 5; i++) nz(t + i * 0.2, 0.08, { f: 1500 + Math.random() * 800, q: 2, peak: 0.35 }); },
    creak(t) { const c = ac(), o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = "sawtooth"; o.frequency.setValueAtTime(140, t); o.frequency.linearRampToValueAtTime(260, t + 1.1);
      lfo.frequency.value = 30; lg.gain.value = 40; lfo.connect(lg); lg.connect(o.frequency);
      env(g, t, 0.1, 0.08, 1.1); o.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + 1.3); lfo.stop(t + 1.3); },
    sad(t) { [523, 466, 392].forEach((f, i) => tone("triangle", f, t + i * 0.35, 0.6, 0.12)); },
    cheer(t) { [523, 659, 784, 1046].forEach((f, i) => tone("triangle", f, t + i * 0.1, 0.5, 0.14)); nz(t + 0.2, 1.2, { f: 1500, q: 0.5, peak: 0.1, a: 0.2 }); },
    owl(t) { [0, 0.55].forEach(d => { tone("sine", 420, t + d, 0.35, 0.3, sfxBus, 360, 0.06); }); },
    snore(t) { [0, 1.6].forEach(d => { nz(t + d, 0.9, { type: "lowpass", f: 300, q: 6, peak: 0.35, a: 0.5 }); tone("sawtooth", 70, t + d, 0.9, 0.05, sfxBus, 60, 0.5); }); },
    roar(t) { const c = ac(), o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.linearRampToValueAtTime(80, t + 1.2);
      f.type = "lowpass"; f.frequency.value = 700; env(g, t, 0.15, 0.3, 1.2); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1.5);
      nz(t, 1.2, { type: "lowpass", f: 800, peak: 0.3, a: 0.15 }); },
    growl(t) { const c = ac(), o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = 75; f.type = "lowpass"; f.frequency.value = 400;
      env(g, t, 0.1, 0.25, 0.8); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1); },
    howl(t) { const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.setValueAtTime(400, t); o.frequency.linearRampToValueAtTime(700, t + 0.6); o.frequency.linearRampToValueAtTime(500, t + 2);
      env(g, t, 0.3, 0.2, 1.8); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 2.3); },
    squeak(t) { [0, 0.18].forEach(d => tone("sine", 2400, t + d, 0.1, 0.15, sfxBus, 3200)); },
    chirp(t) { for (let i = 0; i < 6; i++) tone("sine", 4200, t + i * 0.09, 0.04, 0.08, sfxBus, 4800); },
    cluck(t) { [0, 0.2, 0.4].forEach(d => tone("square", 520, t + d, 0.08, 0.08, sfxBus, 380)); },
    quack(t) { [0, 0.3].forEach(d => { const c = ac(), o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.setValueAtTime(320, t + d); o.frequency.linearRampToValueAtTime(240, t + d + 0.18);
      f.type = "bandpass"; f.frequency.value = 1200; f.Q.value = 3; env(g, t + d, 0.01, 0.4, 0.18); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t + d); o.stop(t + d + 0.25); }); },
    woof(t) { [0, 0.3].forEach(d => { tone("sawtooth", 260, t + d, 0.12, 0.2, sfxBus, 140); nz(t + d, 0.1, { type: "lowpass", f: 900, peak: 0.3 }); }); },
    meow(t) { const c = ac(), o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.setValueAtTime(500, t); o.frequency.linearRampToValueAtTime(800, t + 0.25); o.frequency.linearRampToValueAtTime(450, t + 0.6);
      f.type = "bandpass"; f.frequency.value = 1400; f.Q.value = 2; env(g, t, 0.05, 0.3, 0.55); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 0.7); },
    sheep(t) { const c = ac(), o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain(), f = c.createBiquadFilter();
      o.type = "sawtooth"; o.frequency.value = 300; lfo.frequency.value = 9; lg.gain.value = 25; lfo.connect(lg); lg.connect(o.frequency);
      f.type = "bandpass"; f.frequency.value = 1100; f.Q.value = 2; env(g, t, 0.05, 0.3, 0.7); o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); lfo.start(t); o.stop(t + 0.8); lfo.stop(t + 0.8); },
    heehaw(t) { [[700, 0], [350, 0.35], [700, 0.75], [350, 1.1]].forEach(([f, d]) => tone("sawtooth", f, t + d, 0.3, 0.08, sfxBus, f * 0.9, 0.04)); },
    // UI sounds
    tap(t) { tone("sine", 880, t, 0.06, 0.15); },
    open(t) { tone("triangle", 523, t, 0.1, 0.12); tone("triangle", 784, t + 0.07, 0.15, 0.12); },
    close(t) { tone("triangle", 784, t, 0.1, 0.1); tone("triangle", 523, t + 0.07, 0.15, 0.1); },
    right(t) { [659, 784, 1046].forEach((f, i) => tone("sine", f, t + i * 0.08, 0.3, 0.18)); },
    wrong(t) { tone("triangle", 300, t, 0.25, 0.15, sfxBus, 220); },
    star(t) { FX.sparkle(t); FX.chime(t + 0.3); }
  };

  /* ---------- ambience: looping, gentle, generative ---------- */
  function stopAmb() {
    clearInterval(ambTimer); ambTimer = null;
    ambNodes.forEach(n => { try { n.stop(); } catch (e) {} }); ambNodes = [];
  }
  function bed(type, f, q, level) { // constant filtered noise bed
    const c = ac(), s = noise(), fl = c.createBiquadFilter(), g = c.createGain();
    fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = level;
    s.connect(fl); fl.connect(g); g.connect(ambBus); s.start(); ambNodes.push(s);
  }
  const AMB = {
    night() { bed("lowpass", 250, 1, 0.08);
      ambTimer = setInterval(() => { const t = now(); for (let i = 0; i < 3; i++) tone("sine", 4400 + Math.random() * 300, t + i * 0.06, 0.03, 0.03, ambBus);
        if (Math.random() < 0.08) tone("sine", 420, t + 0.3, 0.4, 0.06, ambBus, 360, 0.08); }, 700); },
    forest() { bed("lowpass", 500, 1, 0.07);
      ambTimer = setInterval(() => { if (Math.random() < 0.5) { const t = now(), f = 2500 + Math.random() * 2000; for (let i = 0; i < 3; i++) tone("sine", f, t + i * 0.1, 0.06, 0.04, ambBus, f * 1.2); } }, 1300); },
    birds() { bed("bandpass", 800, 0.5, 0.03);
      ambTimer = setInterval(() => { if (Math.random() < 0.6) { const t = now(), f = 3000 + Math.random() * 2500; tone("sine", f, t, 0.12, 0.05, ambBus, f * 1.4); tone("sine", f * 1.2, t + 0.15, 0.1, 0.04, ambBus, f); } }, 900); },
    farm() { AMB.birds(); },
    desert() { bed("lowpass", 350, 3, 0.09);
      ambTimer = setInterval(() => { if (Math.random() < 0.3) nz(now(), 2.5, { type: "lowpass", f: 300, f2: 700, q: 5, peak: 0.08, a: 1, out: ambBus }); }, 2500); },
    water() { bed("lowpass", 600, 0.7, 0.05);
      ambTimer = setInterval(() => nz(now(), 2.2, { type: "lowpass", f: 400, f2: 1200, peak: 0.1, a: 1.0, out: ambBus }), 3200); },
    home() { bed("lowpass", 200, 1, 0.04);
      ambTimer = setInterval(() => { if (Math.random() < 0.5) nz(now(), 0.03, { type: "highpass", f: 2500, peak: 0.05, out: ambBus }); }, 400); }
  };

  /* ---------- recorded ElevenLabs sounds (preferred), synth above is the fallback ---------- */
  const BUF = {}, LOADING = {};
  function load(file) {
    if (BUF[file]) return Promise.resolve(BUF[file]);
    if (!LOADING[file]) LOADING[file] = fetch("assets/audio/sfx/" + file + ".mp3")
      .then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); })
      .then(b => new Promise((res, rej) => ac().decodeAudioData(b, res, rej)))
      .then(buf => (BUF[file] = buf))
      .catch(e => { delete LOADING[file]; throw e; });
    return LOADING[file];
  }
  function playBuf(buf, t, out = sfxBus, gain = 1) {
    const src = ac().createBufferSource(), g = ac().createGain(); src.buffer = buf; g.gain.value = gain;
    src.connect(g); g.connect(out); src.start(t); return { src, g };
  }
  let ambToken = 0, ambSrc = null;
  function stopAll() {
    ambToken++; stopAmb();
    if (ambSrc) { const { src, g } = ambSrc; try { g.gain.setTargetAtTime(0, now(), 0.4); src.stop(now() + 1.5); } catch (e) {} ambSrc = null; }
  }

  window.SFX = {
    play(name, delay = 0) {
      if (window.APPSET && !APPSET.sfx) return;
      const t = now() + delay;
      if (BUF[name]) return playBuf(BUF[name], t);
      load(name).catch(() => {}); // warm it for next time
      if (FX[name]) try { FX[name](t); } catch (e) {}
    },
    preload(names) { names.forEach(n => load(n).catch(() => {})); },
    amb(name) {
      stopAll();
      if (!name || (window.APPSET && !APPSET.amb)) return;
      const tok = ambToken; ac();
      load("amb-" + name).then(buf => {
        if (tok !== ambToken) return;
        const src = ac().createBufferSource(), g = ac().createGain(); src.buffer = buf; src.loop = true;
        g.gain.setValueAtTime(0.0001, now()); g.gain.exponentialRampToValueAtTime(1, now() + 2.5);
        src.connect(g); g.connect(ambBus); src.start(); ambSrc = { src, g };
      }).catch(() => { if (tok === ambToken && AMB[name]) AMB[name](); });
    },
    stopAmb: stopAll,
    unlock() { ac(); SFX.preload(["tap", "open", "close", "right", "wrong", "star", "pop", "sparkle", "chime"]); },
    names: Object.keys(FX),
    setVolume(kind, v) { vol[kind] = v; if (ctx) (kind === "sfx" ? sfxBus : ambBus).gain.value = v; }
  };
})();
