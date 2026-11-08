# StoryBloom: Read, Dream & Play (ages 3–8)

An offline learning-to-read app with bedtime stories, guided reading, games,
hands-on activities and printables. Built as an installable web app (PWA).

## Put it on your tablet / phone
The app has to be opened from a web address **once** so it can save itself for offline use.
1. It's hosted on GitHub Pages (see the repo's About link), or upload this folder to any static host, for example:
   - **Netlify Drop**: go to app.netlify.com/drop and drag the `storybloom` folder in.
   - or GitHub Pages, Cloudflare Pages, Vercel, etc.
2. Open the address on the child's device in Safari (iPad/iPhone) or Chrome (Android).
3. Wait for the "✅ Ready to use offline!" message (about 19 MB downloads in the background).
4. Add it to the home screen: Safari → Share → *Add to Home Screen*; Chrome → ⋮ → *Install app*.
5. From now on it opens full-screen and works with **no internet**.

To try it on a computer: `python3 -m http.server` inside this folder, then open http://localhost:8000.

## What's inside
| Section | Contents |
|---|---|
| 📖 Learn to Read (5-step course) | ABC Sounds, Trace Letters, First Sounds, Sound Blender, Rhyme Time, Sight Word Pop (40 words, 4 sets), Picture Match, Build-a-Word, Little Readers (6 leveled books × 3 reading modes + comprehension questions + record-yourself) |
| 🌙 Bedtime Stories | 20 illustrated, fully narrated stories (9 short originals incl. 4 set in the UAE, 11 classic fairytales/fables), word-by-word highlighting, timed sound effects, nature ambience, lullaby, sleep timer, moral + talk-about-it card |
| ✂️ Make Together | 16 parent-and-child activities designed for apartment life in Dubai (indoor, balcony, lift & lobby, supermarket, beach/desert outings in cooler months) with printable cards |
| 🖨️ Print Shop | Print preview for every sheet, 9 ready-made PDF packs (assets/print/), letter tracing A–Z, name tracing, sight-word sheets with word search, cut & match, word families, beginning sounds, story sequencing (any story), reader comprehension, reading chart, 8 colouring pages (also colour on screen) |
| 🎵 Sing Along | 10 songs with read-along lyrics: 6 originals (Jungle Groove, The Letter Sound Train, Sight Word Shake, Camel Shuffle, Swim With Me, Rainbow Colours, Brush Bath Book Bed) and classic nursery songs (Old MacDonald, The Wheels on the Bus, Twinkle Twinkle), plus Dance mode |
| ⭐ Sticker Book | Stars and 36 collectible stickers (tap the star counter on the home screen) |
| ⚙️ Grown-ups (hold to open) | Sound settings, child's name, progress report, suggested path by age, reset |

## Notes
- Voices: ElevenLabs (via Higgsfield). Songs and sound effects: ElevenLabs. Illustrations and colouring pages: Higgsfield.
- If a recorded sound effect can't load, a synthesised version plays instead.
- Words without a recording fall back to the device's built-in voice.
- Progress is saved on the device only. No accounts, no tracking, no ads, no internet needed.
- After changing any files, run `python3 build-sw.py` so the offline cache updates.
- After changing worksheets, rebuild the PDF packs: serve the folder on port 8765 and run `node build-pdfs.js` (needs Playwright).
- GitHub Pages: pushing to `main` deploys automatically via `.github/workflows/pages.yml`.
