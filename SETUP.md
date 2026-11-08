# Putting StoryBloom on unscrolled.me

Everything runs on **Netlify** (free plan is enough to start). No database to set up: codes, the waitlist and payments are stored in Netlify Blobs automatically.

What's on the site:

| Address | What it is |
|---|---|
| unscrolled.me | StoryBloom page: waitlist now, checkout later |
| unscrolled.me/app | The StoryBloom app (locked until a code is entered) |
| unscrolled.me/admin | Your dashboard: waitlist, give codes, extend, switch off |
| unscrolled.me/thanks | Shown after a Ziina payment, with the family's code |
| unscrolled.me/privacy | Privacy & refund policy |
| unscrolled.me/setup-keys | Makes the secret values for step 2 (one time) |

---

## Part 1: go live for early access (no payments yet)

1. **Create the Netlify site**
   Netlify → *Add new site* → *Import an existing project* → GitHub → `aiindiasub26/storybloom`.
   Branch: `main` (or `unscrolled-shop` if the pull request isn't merged yet). Leave the build settings as they are; they come from `netlify.toml`. Deploy.

2. **Add the secret values**
   Open `https://<your-site>.netlify.app/setup-keys/`. Copy the values into Netlify → *Site configuration* → *Environment variables*:
   - `PASS_PRIVATE_JWK`: the long key
   - `ADMIN_PASSWORD`: your admin password
   - `SALES_MODE`: `waitlist`
   - `SITE_URL`: `https://unscrolled.me`

   Then *Deploys* → *Trigger deploy* → *Deploy site* (the key is built into the app).

3. **Connect the domain**
   Netlify → *Domain management* → *Add a domain* → `unscrolled.me`. Follow the DNS instructions at the company where you bought the domain. HTTPS switches on by itself, usually within an hour. If unscrolled.me currently shows another website, this replaces it.

4. **Try it yourself**
   - Open unscrolled.me/admin, log in, *Give a code* to yourself (Early access, 21 days).
   - Open the link on your daughter's tablet, wait for "Ready to use offline", add it to the home screen.
   - Switch on airplane mode and open it again.

5. **Retire the old GitHub address**
   Merge the pull request into `main`. The old `aiindiasub26.github.io/storybloom` address then shows "StoryBloom has moved" and clears the old free copy from devices that open it.
   Then make the GitHub repository **private** (GitHub → *Settings* → *General* → *Danger zone* → *Change visibility*). Netlify keeps working; otherwise anyone can download the stories and songs straight from GitHub.

### Running early access
- Parents join the waitlist on unscrolled.me (with an "I'd join the Google Meet" tick box).
- In /admin, tap **Give early access** next to a name → **Create code** → **Open in WhatsApp** (the message is written for you: code, link, 21 days, the Meet).
- After 21 days the app locks on its own, even offline, with a "your early access has ended" screen.
- Want to keep a family going until the Google Meet? **+7 days** or **+ days…** in the families list.
- **Copy Google Meet invite list** gives you everyone who ticked the box.

---

## Part 2: start selling (when you're ready)

1. In Ziina Business, create an **API key** (Developers / API section) that can create payment intents and webhooks.
2. In Netlify environment variables add:
   - `ZIINA_API_KEY`: the key
   - `ZIINA_WEBHOOK_SECRET`: the value from /setup-keys
   - `ZIINA_TEST`: `1` (test mode first, no money moves)
   - `SALES_MODE`: change to `founding`
3. Redeploy. In /admin → *Payments* → **Connect Ziina payment notifications**.
4. Buy once yourself in test mode. You should land on the thank-you page with a code.
5. Delete `ZIINA_TEST`, redeploy. You're selling.

When the 100 founding spots are gone the site switches to AED 79 by itself. Founding families keep AED 39 when they renew.

### Optional: automatic emails
Without email, codes show on the thank-you page and in /admin (send them on WhatsApp). To email codes and renewal reminders (14 and 3 days before the year ends):
1. Create a free account at resend.com, add the domain `unscrolled.me` and add the DNS records it shows.
2. Add `RESEND_API_KEY` and `EMAIL_FROM` (`StoryBloom <hello@unscrolled.me>`) in Netlify. Redeploy.

---

## All settings

| Variable | Needed | What it does |
|---|---|---|
| `PASS_PRIVATE_JWK` | yes | Signs passes. Changing it makes every device enter its code again. |
| `ADMIN_PASSWORD` | yes | Login for /admin (8+ characters) |
| `SITE_URL` | yes | `https://unscrolled.me` |
| `SALES_MODE` | yes | `waitlist` (early access) · `founding` (AED 39 for the first 100, then 79) · `open` (79) · `closed` |
| `ZIINA_API_KEY` | to sell | From Ziina Business |
| `ZIINA_WEBHOOK_SECRET` | to sell | Lets the site trust Ziina's payment notifications |
| `ZIINA_TEST` | testing | `1` = Ziina test mode |
| `FOUNDING_LIMIT` / `FOUNDING_PRICE` / `REGULAR_PRICE` | optional | Defaults 100 / 39 / 79 (AED) |
| `MAX_DEVICES` | optional | Devices per code, default 3 |
| `CHECKIN_DAYS` | optional | How long a device can stay offline before it must connect once, default 35 |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_REPLY_TO` | optional | Automatic emails |

## How the lock works (in short)
- A code unlocks a device and gives it a **signed pass**: who it belongs to, valid until when. Editing it breaks the signature.
- Offline, the app checks the pass on the device: the end date, a check-in date (online at least once every 5 weeks) and whether the clock has been turned back.
- Online, the app quietly refreshes the pass, which picks up renewals, extensions and switched-off codes.
- The stories, songs, pictures and printables are only downloaded by a device with a valid pass.

## For developers
- `npm install`, then `npm run dev` runs the whole site locally on http://localhost:8888 with a fake Ziina (admin password `localadmin`; `SALES_MODE=founding npm run dev` to test buying).
- `npm test` runs the browser end-to-end check (needs Playwright).
- App content changes: edit files in `site/app/`; the offline file list (`sw.js`) is rebuilt on every deploy.
