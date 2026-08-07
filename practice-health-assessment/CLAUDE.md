# Practice Health Assessment — Project Guide

A single-page, self-contained web app that runs a DISC-style practice-health
assessment during live presentations. It scores six dimensions of practice
health, shows a hexagon radar + a downloadable JPEG scorecard, and emails the
results (via EmailJS) to the attendee and to Nathan.

**Brand:** Nathan Bush personal brand (nathanbushmba.com) — not Snapscale. Do
not apply Snapscale branding, colors, or voice here.

## Architecture

- Pure static front end. No build step, no framework, no bundler, no `package.json`.
- One file does everything: `index.html` — HTML + CSS + vanilla JS, all inline.
- External dependencies: the EmailJS browser SDK (CDN) and Google Fonts. Nothing else.
- Runs fully client-side, so any number of people can take it simultaneously.
- Must keep working on mobile — attendees take it on their phones in the room.

## Files

- `index.html` — the entire app. The `CONFIG` object at the top of the `<script>`
  block is the only thing you edit to go live.
- `templates/client-scorecard-email.html` — EmailJS template sent to the attendee (Nathan's voice).
- `templates/owner-lead-alert-email.html` — EmailJS template sent to Nathan as a lead alert.

## The scoring model — do NOT change casually

- Six dimensions: `leadership`, `operational`, `communication`, `staffing`,
  `technology`, `financial` (see the `DIMENSIONS` array).
- 30 questions total, exactly 5 per dimension (`QUESTIONS` array). Each answer
  scores 1 (worst) to 4 (best).
- Per-dimension score = `round((sum - 5) / (20 - 5) * 100)` → 0–100.
- Overall = average of the six dimension scores.
- Tiers (`TIERS` array): 80–100 Strong, 60–79 Building, 40–59 Strained, 0–39 Critical.

If you add or remove questions, keep exactly 5 per dimension or the scoring
skews. If you change the 1–4 answer scale, update the score formula to match.

## EmailJS integration

- `CONFIG` keys: `emailPublicKey`, `emailServiceId`, `clientTemplateId`, `ownerTemplateId`,
  plus `ownerEmail` (where lead alerts go) and `bookingLink` (the scorecard CTA).
- On completion, `sendResults()` sends TWO emails via `emailjs.send`, passing these
  template variables: `name`, `email`, `phone`, `title`, `organization`, `overall_score`,
  `overall_tier`, and for each dimension `<key>_score` / `<key>_tier`, plus `booking_link`,
  `owner_email`, `completed_at`, `to_email`, `reply_to`.
- Each EmailJS template MUST set, in its EmailJS settings, **To Email = `{{to_email}}`**
  and **Reply To = `{{reply_to}}`**. A blank To Email field is the most common cause
  of "no emails arriving."
- Only `emailPublicKey`, `emailServiceId`, `clientTemplateId`, `ownerTemplateId` gate
  whether a send is attempted at all — if any of those four are left at their
  placeholder value, sending is skipped entirely (and `?debug=1` reports it in orange).

## Local testing

- Serve locally: `python3 -m http.server` then open `http://localhost:8000`.
- Append `?debug=1` to the URL to see send success/failure printed on screen
  (and richer logs in the browser console).
- With `CONFIG` left at placeholder values, the assessment still runs end to end;
  the email step is simply skipped.

## Deploy

Any static host. Production target: WordPress at `nathanbushmba.com/assessment`,
uploaded as `public_html/assessment/index.html`.

## Conventions / guardrails

- Keep everything in `index.html`. Don't split into modules or introduce a build step.
- No `localStorage` / `sessionStorage`.
- Preserve `prefers-reduced-motion` handling (already implemented).
- Keep copy in Nathan's voice: direct, insight-driven, lightly contrarian, no hype.
