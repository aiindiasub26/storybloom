# Putting StoryBloom on unscrolled.me

Everything runs on **Netlify** (free plan is enough to start). No database to set up: codes, the waitlist and payments are stored in Netlify Blobs automatically.

What's on the site:

| Address | What it is |
|---|---|
| unscrolled.me | unscrolled. brand home: lists StoryBloom (status follows the sales stage) |
| unscrolled.me/storybloom | StoryBloom page: waitlist now, checkout later |
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
- Parents join the waitlist on unscrolled.me/storybloom with their **email** (WhatsApp optional) and an "I'd join the Google Meet" tick box.
- In /admin, tap **Approve & email code** next to a family, or **Approve all waiting**. Each family gets a 21-day code by email straight away, with the link, tablet steps and the Google Meet note.
- No email set up yet, or a family without email? /admin shows a ready WhatsApp message with **Open in WhatsApp** instead.
- After 21 days the app locks on its own, even offline, with a "your early access has ended" screen.
- Want to keep a family going until the Google Meet? **+7 days** or **+ days…** in the families list. **Email code again** resends it.
- **Copy Google Meet invite list** gives you everyone who ticked the box.

### Emails: hello@unscrolled.me for free (do this before approving families)
Two free services, about 20 minutes, both only need DNS records where unscrolled.me is managed (Netlify DNS if you moved the domain there in step 3, otherwise your domain company):

1. **Receive at hello@unscrolled.me → your Gmail (ImprovMX, free)**
   improvmx.com → enter `unscrolled.me` and your Gmail address → add the two **MX** records and the **TXT** (SPF) record it shows → wait for the green ticks. Mail to hello@unscrolled.me now lands in Gmail. Free plan: 1 domain, 25 addresses, 500 forwarded emails a day. It forwards only; your own replies go from your Gmail address.
2. **Send codes and reminders from hello@unscrolled.me (Resend, free)**
   resend.com → *Domains* → add `unscrolled.me` → add the DNS records it shows (they sit on a `send.` subdomain, so they don't clash with ImprovMX) → *API keys* → create one with sending access.
   In Netlify add `RESEND_API_KEY` (the key) and `EMAIL_FROM` = `StoryBloom <hello@unscrolled.me>`, then redeploy. Free plan: 3,000 emails a month, 100 a day.
   Parents' replies go to hello@unscrolled.me, so they reach your Gmail through ImprovMX.
3. In /admin the overview should now say **Email: on**. Approve yourself first (join the waitlist with your own email) to see the email.

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

Once sales are open, paid families get their code by email within seconds of paying (it also shows on the thank-you page), and everyone gets renewal reminders 14 and 3 days before their year ends.

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
| `RESEND_API_KEY` / `EMAIL_FROM` | for emails | Sends codes and reminders (see "Emails" above) |
| `EMAIL_REPLY_TO` | optional | Where parents' replies go, default `hello@unscrolled.me` |
| `EARLY_DAYS` | optional | Length of early access when you tap Approve, default 21 |

## How the lock works (in short)
- A code unlocks a device and gives it a **signed pass**: who it belongs to, valid until when. Editing it breaks the signature.
- Offline, the app checks the pass on the device: the end date, a check-in date (online at least once every 5 weeks) and whether the clock has been turned back.
- Online, the app quietly refreshes the pass, which picks up renewals, extensions and switched-off codes.
- The stories, songs, pictures and printables are only downloaded by a device with a valid pass.

## For developers
- `npm install`, then `npm run dev` runs the whole site locally on http://localhost:8888 with a fake Ziina and a fake email outbox at /__resend/outbox (admin password `localadmin`; `SALES_MODE=founding npm run dev` to test buying).
- `npm test` runs the browser end-to-end check (needs Playwright).
- App content changes: edit files in `site/app/`; the offline file list (`sw.js`) is rebuilt on every deploy.
