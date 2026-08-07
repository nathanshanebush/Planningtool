# Practice Health Assessment

A self-contained web app for live presentations. Attendees answer 30 questions
(one at a time, DISC-style), get an instant six-dimension practice-health score
with a radar chart and a downloadable JPEG scorecard, and receive their results
by email. A lead-alert email is sent to Nathan for every completion.

Six dimensions scored: Leadership, Operational, Communication, Staffing,
Technology & AI, Financial.

It's one static HTML file — no server, no database, no build. It handles any
number of simultaneous takers because everything runs in the browser.

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

## 2. Configure the app

Open `index.html`, find the `CONFIG` object near the top of the `<script>` block,
and fill in the four values:

```js
const CONFIG = {
  emailPublicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  emailServiceId: 'YOUR_EMAILJS_SERVICE_ID',
  clientTemplateId: 'YOUR_CLIENT_TEMPLATE_ID',
  ownerTemplateId: 'YOUR_OWNER_TEMPLATE_ID',
  ownerEmail: 'you@nathanbushmba.com',
  bookingLink: 'https://calendly.com/your-link',
};
```

The "Talk through my scorecard" button link is set via `bookingLink`
(currently your Calendly).

## 3. Test before going live

Open the page with `?debug=1` appended to the URL and complete it once.
The line under your scores reports what happened:

- **green** — both emails accepted by EmailJS. Check your inbox and spam.
- **orange** — send skipped; the four `CONFIG` values aren't all filled in.
- **red** — EmailJS rejected the send; the message tells you why.

Cross-check in EmailJS → Email History, which logs every send.

Most common failure: the template's **To Email** field is left blank. It must
be `{{to_email}}` in both templates.

## 4. Deploy

Upload `index.html` to your web host as `public_html/assessment/index.html`.
It's then live at `nathanbushmba.com/assessment`.

## Notes

- **Free tier volume:** EmailJS free allows ~200 sends/month. Each completion is 2
  emails, so free covers ~100 people/month. For a large event, upgrade for that
  month, then downgrade. Past the cap nothing breaks — attendees still see and
  download their scorecard; only the emails stop.
- **Security:** in EmailJS → Account → Security, add `nathanbushmba.com` to allowed
  origins so no one else can send through your keys.
- **Editing the assessment:** see `CLAUDE.md` for the scoring rules — keep exactly
  5 questions per dimension.
