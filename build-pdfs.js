// Builds the ready-made PDF packs in assets/print/ from the app's own worksheet makers.
// Run with a local server on :8765:  node build-pdfs.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('http://localhost:8765/index.html'); await p.waitForTimeout(1500);
  const packs = {
    'letters-a-z.pdf': `LETTERS.map(L => MAKERS.letter(L.l))`,
    'sight-words.pdf': `SIGHT.map((s, i) => MAKERS.sight(i))`,
    'word-families.pdf': `Object.keys(FAMILIES).map(f => MAKERS.family(f))`,
    'phonics-practice.pdf': `[MAKERS.cutmatch(), MAKERS.cutmatch(), MAKERS.cutmatch(), MAKERS.begin(), MAKERS.begin(), MAKERS.begin()]`,
    'story-order.pdf': `STORIES.map(s => MAKERS.sequence(s.id))`,
    'reader-questions.pdf': `READERS.map(b => MAKERS.reader(b.id))`,
    'colouring.pdf': `COLOURING.map(c => MAKERS.colour(c.id))`,
    'activity-cards.pdf': `ACTIVITIES.map(a => activitySheet(a)[0])`,
    'reading-chart.pdf': `[MAKERS.chart()]`
  };
  await p.emulateMedia({ media: 'print' });
  for (const [file, expr] of Object.entries(packs)) {
    await p.evaluate(expr => { const root = document.getElementById('print-root'); root.innerHTML = eval(expr).join(''); }, expr);
    await p.evaluate(() => Promise.all([...document.querySelectorAll('#print-root img')].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
    // shrink every picture to a light-greyscale JPEG on white (small files, ink-friendly); colouring pages stay crisp line art
    await p.evaluate(() => Promise.all([...document.querySelectorAll('#print-root img, #print-root image')].map(i => {
      const src = i.getAttribute('src') || i.getAttribute('href'); if (/colour\//.test(src)) return 1;
      return new Promise(res => { const im = new Image(); im.onload = () => {
        const c = document.createElement('canvas'), w = Math.min(600, im.naturalWidth); c.width = w; c.height = Math.round(im.naturalHeight * w / im.naturalWidth);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
        x.filter = /story\/|reader\//.test(src) ? 'grayscale(1) brightness(1.55) contrast(0.5)' : 'grayscale(1) brightness(1.15) contrast(0.88)'; x.drawImage(im, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', 0.7);
        i.classList.remove('pic-ink'); i.classList.add('keep-ink');
        if (i.tagName.toLowerCase() === 'image') { i.setAttribute('href', url); res(); } else { i.onload = res; i.src = url; }
      }; im.onerror = res; im.src = src; });
    })));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.evaluate(() => { document.documentElement.style.background = '#fff'; document.body.style.background = '#fff'; });
    await p.pdf({ path: 'assets/print/' + file, format: 'A4', printBackground: false });
    console.log(file);
  }
  await b.close();
})();
