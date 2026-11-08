# StoryBloom: Read, Dream & Play (ages 3–8)

An offline learning-to-read app with bedtime stories, guided reading, games,
hands-on activities and printables. Built as an installable web app (PWA).

## Put it on your tablet / phone
The app has to be opened from a web address **once** so it can save itself for offline use.
1. Upload this whole folder to any static host, for example:
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
| 🖨️ Print Shop | Letter tracing A–Z, name tracing, sight-word sheets with word search, cut & match, word families, beginning sounds, story sequencing (any story), reader comprehension, reading chart, 8 colouring pages (also colour on screen) |
| ⭐ Sticker Book | Stars and 36 collectible stickers for completed activities |
| ⚙️ Grown-ups (hold to open) | Sound settings, child's name, progress report, suggested path by age, reset |

## Notes
- Voices: ElevenLabs (via Higgsfield). Illustrations and colouring pages: Higgsfield.
- Sound effects and ambience are synthesised live in the browser (no files, fully offline).
- Words without a recording fall back to the device's built-in voice.
- Progress is saved on the device only. No accounts, no tracking, no ads, no internet needed.
- After changing any files, run `python3 build-sw.py` so the offline cache updates.
