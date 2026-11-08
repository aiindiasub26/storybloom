// Emails go out through Resend (resend.com) when RESEND_API_KEY is set.
// Without it nothing is emailed: the code still shows on the thank-you page and in Admin.
import { siteUrl } from "./core.mjs";

export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return { sent: false, reason: key ? "no address" : "email not set up" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "StoryBloom <hello@unscrolled.me>",
        to: [to],
        reply_to: process.env.EMAIL_REPLY_TO || undefined,
        subject,
        html
      })
    });
    return { sent: res.ok, reason: res.ok ? "" : "Resend error " + res.status };
  } catch (e) {
    return { sent: false, reason: String(e.message || e) };
  }
}

const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = ms => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dubai" });

function wrap(inner) {
  return `<div style="background:#fbf6ec;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#2f2a3b">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #2f2a3b;border-radius:18px;padding:28px">
  <div style="font-size:26px;font-weight:bold;margin-bottom:12px">StoryBloom</div>${inner}
  <p style="color:#5d5670;font-size:13px;margin-top:28px">Made by a Gulf parent at unscrolled.me · Questions? Reply to this email or DM @unscrolled.uae on Instagram.</p>
  </div></div>`;
}

export function welcomeEmail(m) {
  const open = siteUrl() + "/app/?code=" + encodeURIComponent(m.code);
  return {
    subject: "Your StoryBloom code is here",
    html: wrap(`<p>Hi ${esc(m.name) || "there"},</p>
<p>Thank you for joining StoryBloom${m.plan === "founding" ? " as a founding family" : ""}. Here is your code:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:2px;background:#fff3c4;border-radius:12px;padding:14px;text-align:center">${esc(m.code)}</p>
<p><a href="${open}" style="display:inline-block;background:#2f2a3b;color:#fff;padding:12px 22px;border-radius:24px;text-decoration:none;font-weight:bold">Open StoryBloom</a></p>
<p><b>On your child's tablet:</b> open the link above in Safari (iPad) or Chrome (Android), wait for "Ready to use offline", then add it to the home screen. After that it works with no internet.</p>
<p>Your code works on up to ${Number(process.env.MAX_DEVICES || 3)} devices and is active until <b>${fmt(m.until)}</b>.</p>`)
  };
}

export function renewEmail(m, daysLeft) {
  const link = siteUrl() + "/storybloom/?renew=" + encodeURIComponent(m.code);
  return {
    subject: daysLeft <= 3 ? "StoryBloom ends in " + daysLeft + " days" : "Your StoryBloom year ends soon",
    html: wrap(`<p>Hi ${esc(m.name) || "there"},</p>
<p>Your StoryBloom year ends on <b>${fmt(m.until)}</b>. Renew now to keep the stories, songs and activities going${m.plan === "founding" ? ", at your founding-family price of AED " + m.price : ""}.</p>
<p><a href="${link}" style="display:inline-block;background:#2f2a3b;color:#fff;padding:12px 22px;border-radius:24px;text-decoration:none;font-weight:bold">Renew StoryBloom</a></p>
<p>Your code stays the same, and nothing to reinstall.</p>`)
  };
}
