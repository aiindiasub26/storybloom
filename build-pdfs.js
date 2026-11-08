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
    // shrink photos to print resolution JPEGs so the PDFs stay small
    await p.evaluate(() => Promise.all([...document.querySelectorAll('#print-root img')].filter(i => !/\.png$/.test(i.getAttribute('src'))).map(i => {
      const c = document.createElement('canvas'), w = Math.min(700, i.naturalWidth); c.width = w; c.height = Math.round(i.naturalHeight * w / i.naturalWidth);
      c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); i.src = c.toDataURL('image/jpeg', 0.72);
      return new Promise(r => { i.onload = r; });
    })));
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.pdf({ path: 'assets/print/' + file, format: 'A4', printBackground: true });
    console.log(file);
  }
  await b.close();
})();
