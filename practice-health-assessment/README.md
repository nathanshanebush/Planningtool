# Practice Health Assessment

A self-contained web app for live presentations. Attendees answer 30 questions
(one at a time, DISC-style), get an instant six-dimension practice-health score
with a radar chart and a downloadable JPEG scorecard, and receive their results
by email. A lead-alert email is sent to Nathan for every completion.

Six dimensions scored: Leadership, Operational, Communication, Staffing,
Technology & AI, Financial.

Two files, no build step:

- **`index.html`** — what attendees take. Runs entirely in the browser; handles
  any number of simultaneous takers.
- **`dashboard.html`** — private, login-protected. See every response, a live
  radar/insight view you can project during a talk, trends across every
  session you've ever run, and a referral leaderboard.

Every attendee also gets their own referral link on the results screen
("refer 3 colleagues, get a free scorecard walkthrough with me") and, once
enough same-practice-type data exists, a "you scored higher than X% of
Dental practices" badge.

The only backend is a free [Supabase](https://supabase.com) project (Postgres +
login) — no server to run yourself.

## 1. Set up EmailJS (free)

Email sending uses [EmailJS](https://www.emailjs.com/), which sends mail straight
from the page — no backend.

1. Create a free EmailJS account.
2. Add an **Email Service** (connect the inbox you want to send from, e.g. your
   nathanbushmba.com Google account). Copy the **Service ID**.
3. Create two templates and paste the files from `templates/` into each one's
   HTML/code view:
   - Template 1 → `templates/client-scorecard-email.html` (goes to the attendee)
   - Template 2 → `templates/owner-lead-alert-email.html` (goes to you)
4. For each template, in its settings set:
   - **To Email:** `{{to_email}}`
   - **Reply To:** `{{reply_to}}`
   - **Subject / From Name:** see the comment block at the top of each template file.
5. Copy each **Template ID**.
6. Account → API Keys → copy your **Public Key**.

Fill those four values into `CONFIG` near the top of `index.html`'s `<script>` block.

## 2. Set up the backend (Supabase)

This is what powers `dashboard.html` — logins, saved results, sessions, the live
projector view.

1. Create a free account at [supabase.com](https://supabase.com) → **New project**.
2. Open **SQL Editor** → **New query**, paste in the entire contents of
   `supabase-schema.sql`, and run it. (Safe to re-run any time the file changes —
   it only adds what's missing, never drops data.)
3. **Project Settings → API** → copy the **Project URL** and the **`anon` `public`
   key**. These are safe to put in client-side code — what actually protects the
   data is the row-level-security policies the SQL just created, not secrecy of
   this key.
4. Paste both values into `CONFIG` near the top of **both** `index.html`'s and
   `dashboard.html`'s `<script>` blocks (`supabaseUrl` and `supabaseAnonKey`).
5. **Authentication → Users → Add user** — create your own login (your email +
   a password you choose). This is the only account that can ever log into
   `dashboard.html`. There is no public sign-up.
6. In `dashboard.html`'s `CONFIG`, set `assessmentUrl` to wherever `index.html`
   actually lives (default is `https://nathanbushmba.com/assessment/`) — it's
   used to build the attendee links shown on the Sessions tab.

## 3. Running a presentation (Sessions)

Before a talk, log into `dashboard.html` → **Sessions** tab → name it (e.g.
"Ohio Dental Society — Keynote") → **Create Session**. You get two links:

- **Attendee link** — share this (QR code, slide, etc.) instead of the bare
  assessment URL. Everyone who completes it through this link is grouped under
  this session, with their own name attached to the group.
- **Live screen link** — safe to put on the projector or hand to an AV
  operator. No login needed, no names/emails/phones ever shown — just the
  room's aggregate radar, a tier breakdown, an auto-generated insight about
  the room's weakest dimension, and 3 discussion questions pulled to match it.
  It updates on its own as responses come in.

The live link only works once you flip the session's **Public** toggle on —
that's deliberate, so nothing is projectable until you choose to.

Your own leads (names, emails, phones, full breakdowns) stay on the **Leads**
tab, which always requires login.

## 4. Referrals

No setup needed beyond the schema above — every completed assessment
automatically gets its own referral link, shown to the attendee with copy /
LinkedIn / text-share buttons. When someone completes the assessment through
that link, it's recorded against the original person, and shows up on
`dashboard.html`'s **Referrals** tab: a leaderboard ranked by completions
generated, and a running total of how many completions came from a referral.

The current offer shown to attendees is "refer 3, get a free 1:1 scorecard
walkthrough" for the top 3 referrers — that's copy in `index.html` and
`dashboard.html`, not an automated system. You're on the hook for actually
following up; nothing sends a reminder or resets the leaderboard on its own.

## 5. Test before going live

Open `index.html` with `?debug=1` appended to the URL and complete it once.
The lines under your scores report what happened:

- **green** — accepted (by EmailJS, or saved to the dashboard).
- **orange** — skipped; the relevant `CONFIG` values aren't all filled in.
- **red** — rejected; the message tells you why.

Cross-check emails in EmailJS → Email History, and check the response shows up
under `dashboard.html`'s Leads tab.

Most common EmailJS failure: a template's **To Email** field left blank — it
must be `{{to_email}}` in both templates.

## 6. Deploy

Upload `index.html` **and** `dashboard.html` to your web host as
`public_html/assessment/index.html` and `public_html/assessment/dashboard.html`.
They're then live at `nathanbushmba.com/assessment` and
`nathanbushmba.com/assessment/dashboard.html`.

## Notes

- **Free tier volume:** EmailJS free allows ~200 sends/month (100 people, since
  each completion is 2 emails). Supabase's free tier comfortably covers far more
  than that. For an unusually large event, upgrade EmailJS for that month, then
  downgrade — nothing breaks past the cap, attendees still see/download their
  scorecard and their result still saves to the dashboard; only the emails stop.
- **Security:** in EmailJS → Account → Security, add `nathanbushmba.com` to
  allowed origins so no one else can send through your keys. Supabase's actual
  protection is the RLS policies in `supabase-schema.sql` — review them before
  changing who can read/write what.
- **Editing the assessment:** see `CLAUDE.md` for the scoring rules — keep
  exactly 5 questions per dimension.
