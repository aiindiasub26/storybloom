// Automatic emails (codes, renewal reminders) are sent from the StoryBloom Gmail account
// through Gmail's own mail server, using a Google "app password" (GMAIL_APP_PASSWORD).
// Resend (RESEND_API_KEY) still works as an alternative. With neither set, nothing is
// emailed: codes still show on the thank-you page and in Admin (with a WhatsApp message).
import nodemailer from "nodemailer";
import { siteUrl } from "./core.mjs";

export const CONTACT_EMAIL = "unscrolled.me@gmail.com";
const gmailUser = () => process.env.GMAIL_USER || CONTACT_EMAIL;
const from = () => process.env.EMAIL_FROM || `StoryBloom <${gmailUser()}>`;
const replyTo = () => process.env.EMAIL_REPLY_TO || CONTACT_EMAIL;

export const emailReady = () => !!(process.env.GMAIL_APP_PASSWORD || process.env.RESEND_API_KEY);

let transport;
function gmail() {
  if (!transport) transport = nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true,
    auth: { user: gmailUser(), pass: String(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, "") }
  });
  return transport;
}

export async function sendEmail({ to, subject, html }) {
  if (!to) return { sent: false, reason: "no address" };
  if (!emailReady()) return { sent: false, reason: "email not set up" };
  try {
    if (process.env.GMAIL_APP_PASSWORD) {
      await gmail().sendMail({ from: from(), to, replyTo: replyTo(), subject, html });
      return { sent: true, reason: "" };
    }
    const res = await fetch((process.env.RESEND_API_BASE || "https://api.resend.com") + "/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ from: from(), to: [to], reply_to: replyTo(), subject, html })
    });
    return { sent: res.ok, reason: res.ok ? "" : "Resend error " + res.status };
  } catch (e) {
    console.error("email failed", e);
    return { sent: false, reason: String(e.message || e).slice(0, 200) };
  }
}

const esc = s => String(s || "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = ms => new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dubai" });

function wrap(inner) {
  return `<div style="background:#fbf6ec;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#2f2a3b">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:2px solid #2f2a3b;border-radius:18px;padding:28px">
  <div style="font-size:26px;font-weight:bold;margin-bottom:12px">StoryBloom</div>${inner}
  <p style="color:#5d5670;font-size:13px;margin-top:28px">Made by a Gulf parent at unscrolled.me · Questions? Reply to this email (${CONTACT_EMAIL}) or DM @unscrolled.uae on Instagram.</p>
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
<p><b>Setting it up on your child's tablet</b> (on Wi-Fi):</p>
<ol style="padding-left:20px">
<li><b>iPad or iPhone:</b> open <b>unscrolled.me/app</b> in Safari, tap Share → <b>Add to Home Screen</b>, then open StoryBloom <b>from the new icon</b> (the home-screen app keeps its own storage, separate from Safari).<br><b>Android:</b> open the button above in Chrome, then ⋮ → Install app.</li>
<li>Type your code and tap Unlock.</li>
<li>Keep it open until it says <b>"Ready to use offline"</b> (about a minute). After that it works with no internet.</li>
</ol>
<p>Your code works on up to ${Number(process.env.MAX_DEVICES || 3)} devices and is active until <b>${fmt(m.until)}</b>.</p>`)
  };
}

export function earlyEmail(m) {
  const open = siteUrl() + "/app/?code=" + encodeURIComponent(m.code);
  const days = Math.round((m.until - m.created) / 86400000);
  return {
    subject: "Your StoryBloom early access 🌼",
    html: wrap(`<p>Hi ${esc(m.name) || "there"},</p>
<p>Thank you for joining StoryBloom early access! Here is your code:</p>
<p style="font-size:28px;font-weight:bold;letter-spacing:2px;background:#fff3c4;border-radius:12px;padding:14px;text-align:center">${esc(m.code)}</p>
<p><a href="${open}" style="display:inline-block;background:#2f2a3b;color:#fff;padding:12px 22px;border-radius:24px;text-decoration:none;font-weight:bold">Open StoryBloom</a></p>
<p><b>Setting it up on your child's tablet</b> (on Wi-Fi):</p>
<ol style="padding-left:20px">
<li><b>iPad or iPhone:</b> open <b>unscrolled.me/app</b> in Safari, tap Share → <b>Add to Home Screen</b>, then open StoryBloom <b>from the new icon</b> (the home-screen app keeps its own storage, separate from Safari).<br><b>Android:</b> open the button above in Chrome, then ⋮ → Install app.</li>
<li>Type your code and tap Unlock.</li>
<li>Keep it open until it says <b>"Ready to use offline"</b> (about a minute). After that it works with no internet.</li>
</ol>
<p>Early access is free for <b>${days} days</b>, until ${fmt(m.until)}, on up to ${Number(process.env.MAX_DEVICES || 3)} devices.</p>
<p>After that, I'd love you to join a 1-hour parents' Google Meet to hear what worked, what didn't, and what to build next. I'll send the invite. Founding-family spots open to early families first.</p>
<p>Aswathi</p>`)
  };
}

export const codeEmail = m => (m.plan === "early" ? earlyEmail(m) : welcomeEmail(m));

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
