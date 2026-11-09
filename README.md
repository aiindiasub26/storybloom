# StoryBloom: Read, Dream & Play (ages 3–8)

An offline learning-to-read app with bedtime stories, guided reading, games,
hands-on activities and printables. Built as an installable web app (PWA).

## Where it lives
StoryBloom is the first product on **unscrolled.me** (Netlify), at unscrolled.me/storybloom. Setup steps, settings and how the lock works: see [SETUP.md](SETUP.md).

| Folder | What it is |
|---|---|
| `site/` | The unscrolled.me website: brand home, StoryBloom page (`site/storybloom/`), thank-you, privacy, admin |
| `site/app/` | The StoryBloom app itself (installable, works offline) |
| `netlify/functions/` | Waitlist, Ziina checkout, code unlock, pass refresh, admin, renewal reminders |
| `netlify/edge-functions/gate.js` | Only devices with a valid pass can download the app's content |
| `.github/workflows/pages.yml` | Builds the always-unlocked family copy for aiindiasub26.github.io/storybloom |
| `dev/` | Local test server with a fake Ziina, and the end-to-end browser test |

Families open **unscrolled.me/app**, unlock once with their code, wait for "✅ Ready to use offline!" and add it to the home screen.

## What's inside
| Section | Contents |
|---|---|
| 📖 Learn to Read (5-step course) | ABC Sounds, Trace Letters, First Sounds, Sound Blender, Rhyme Time, Sight Word Pop (40 words, 4 sets), Picture Match, Build-a-Word, Little Readers (6 leveled books × 3 reading modes + comprehension questions + record-yourself) |
| 🌙 Bedtime Stories | 20 illustrated, fully narrated stories (sound effects and nature sounds can each be switched off from the story's top bar) (9 short originals incl. 4 set in the UAE, 11 classic fairytales/fables), word-by-word highlighting, timed sound effects, nature ambience, lullaby, sleep timer, moral + talk-about-it card |
| ✂️ Make Together | 16 parent-and-child activities designed for apartment life in Dubai (indoor, balcony, lift & lobby, supermarket, beach/desert outings in cooler months) with printable cards |
| 🖨️ Print Shop | Print preview for every sheet, 9 ready-made PDF packs (assets/print/), letter tracing A–Z, name tracing, sight-word sheets with word search, cut & match, word families, beginning sounds, story sequencing (any story), reader comprehension, reading chart, 8 colouring pages (also colour on screen) |
| 🎵 Sing Along | 19 songs with read-along lyrics: upbeat kids-pop/funk dance songs (Jungle Groove, Camel Shuffle, Swim With Me, Head Shoulders Knees and Toes, If You're Happy and You Know It), learning songs (Sight Word Shake, Rainbow Colours), 10 classic nursery rhymes, and 2 bedtime songs. Dance mode included |
| ⭐ Sticker Book | Stars and 36 collectible stickers (tap the star counter on the home screen) |
| ⚙️ Grown-ups (hold to open) | Sound settings, child's name, progress report, suggested path by age, reset |

## Notes
- Voices: ElevenLabs (via Higgsfield). Songs and sound effects: ElevenLabs. Illustrations and colouring pages: Higgsfield.
- If a recorded sound effect can't load, a synthesised version plays instead.
- Words without a recording fall back to the device's built-in voice.
- Progress is saved on the device only. No child accounts, no tracking, no ads. Internet is only needed to unlock and for a quick check-in every few weeks.
- The offline file list (`site/app/sw.js`) is rebuilt on every deploy by `scripts/build.mjs`.
- After changing worksheets, rebuild the PDF packs with `scripts/build-pdfs.cjs` (needs Playwright; see the note at the top of the file).

- Pictures and icons are custom illustrated stickers (assets/img/stickers) and hand-drawn SVG icons (js/icons.js); no emoji.
- PDF packs print on plain white paper with light greyscale pictures to save ink.
