# Practice Health Assessment — Project Guide

A DISC-style practice-health assessment that runs during live presentations,
plus a private backend so the presenter can see results, project a live
aggregate view to the room, and review leads afterward.

**Brand:** Nathan Bush personal brand (nathanbushmba.com) — not Snapscale. Do
not apply Snapscale branding, colors, or voice here.

## Architecture

- Static front end, no build step, no framework, no bundler, no `package.json`.
- Three HTML files, each self-contained (HTML + CSS + vanilla JS inline):
  - `index.html` — the attendee-facing assessment.
  - `dashboard.html` — the presenter's private tool (login, sessions, leads, trends,
    referrals, speaking inquiries, and the live projector view).
  - `speak.html` — public, unauthenticated "book Nathan to speak" lead form for
    event organizers. Not linked from `index.html`/`dashboard.html` — share its
    URL directly (site nav, bio links, the live screen, etc.).
- The only backend is Supabase (Postgres + auth), reached via `fetch`/`supabase-js`
  straight from the browser — no server you run or maintain. Schema + RLS policies
  live in `supabase-schema.sql`.
- External dependencies: EmailJS SDK, Supabase JS SDK (dashboard only), Google Fonts.
- Runs fully client-side, so any number of people can take it simultaneously.
- Must keep working on mobile — attendees take it on their phones in the room.

## Files

- `index.html` — the assessment. `CONFIG` near the top of the `<script>` block is
  what you edit to go live (EmailJS + Supabase values).
- `dashboard.html` — presenter dashboard. Its own `CONFIG` (Supabase URL/key +
  `assessmentUrl`) near the top of its `<script>` block.
- `speak.html` — the speaking-inquiry form. Same `CONFIG` shape (`supabaseUrl`,
  `supabaseAnonKey`) as the other two, pointed at the same project.
- `supabase-schema.sql` — run once in the Supabase SQL Editor (safe to re-run any
  time it changes). Creates `sessions`, `submissions`, `speaker_inquiries`, RLS
  policies, and the PII-free aggregate/percentile functions.
- `templates/client-scorecard-email.html` — EmailJS template sent to the attendee.
- `templates/owner-lead-alert-email.html` — EmailJS template sent to Nathan.

## The scoring model — do NOT change casually

- Six dimensions: `leadership`, `operational`, `communication`, `staffing`,
  `technology`, `financial` (see the `DIMENSIONS` array in `index.html`).
- 30 questions total, exactly 5 per dimension (`QUESTIONS` array). Each answer
  scores 1 (worst) to 4 (best).
- Per-dimension score = `round((sum - 5) / (20 - 5) * 100)` → 0–100.
- Overall = average of the six dimension scores.
- Tiers (`TIERS` array): 80–100 Strong, 60–79 Building, 40–59 Strained, 0–39 Critical.

If you add or remove questions, keep exactly 5 per dimension or the scoring
skews. If you change the 1–4 answer scale, update the score formula to match —
and update `avgDims()` / the tier thresholds in `dashboard.html` to match too,
since they duplicate this logic against aggregate data.

## Intake fields

Captured on `index.html`'s start screen: `name`, `email` (both required),
`phone`, `title`, `organization`, and `practiceType` (required — a dropdown,
see the `PRACTICE_TYPES` array). Add a practice type by adding it to that array;
no other changes needed.

## Sessions (naming a presentation's attendees)

A **session** is a name Nathan gives one talk (e.g. "Ohio Dental Society —
Keynote"), created from the Sessions tab in `dashboard.html`. It produces:
- an **attendee link** — `index.html?session=<slug>` — everyone who takes the
  assessment through that link gets tagged with that session in the database.
- a **live screen link** — `dashboard.html?live=<slug>` — unauthenticated,
  PII-free, safe to project. Only works once the session is marked "Public" on
  the Sessions tab (opt-in per session, deliberately).

Results submitted without a `?session=` param land under the `general` session.

## Referral loop

Every saved submission gets its own `referral_code` (client-generated in
`saveSubmission()`: `slugify(name)-<4 random chars>`, retried on the rare
collision). The results screen shows that code as a shareable link —
`index.html?session=<slug>&ref=<code>` — with copy/LinkedIn/text-share
buttons. Whoever completes the assessment through that link gets it recorded
as their `referred_by`. The reward (a free 1:1 scorecard walkthrough for the
top 3 referrers) is a manual thing Nathan honors himself — there's no
automated fulfillment, and the dashboard's Referrals tab leaderboard has no
automatic reset.

`get_peer_percentile` (in `supabase-schema.sql`) also drives the "you scored
higher than X% of `<practice type>` practices" badge on the results screen —
it's hidden below a 5-response sample size per practice type so early data
doesn't produce a misleading 0%/100%.

## Referrals dashboard tab

`renderReferralsTab()` in `dashboard.html` computes everything client-side
from the same `submissions` fetch the other tabs use — no extra query. It
only counts what's actually measurable (completions with a `referred_by`,
grouped back to the referrer's name via their `referral_code`); it does not
fabricate "invites sent" or "booked calls" numbers, since neither is tracked
anywhere yet.

## Booking-click tracking

`flagBookingClick()` in `index.html` fires a fire-and-forget PATCH the moment
someone clicks "Talk Through My Scorecard" — it never blocks or delays the
link's own navigation. It sets `booking_clicked` / `booking_clicked_at` on
that person's own row, using their `id` (captured from the insert response
alongside `referral_code`). RLS + a column-level grant mean an anon request
can only ever touch those two columns, on any row — that's an accepted,
low-impact tradeoff (the data isn't sensitive) to avoid needing auth just to
flag a click. If you ever add real calendar-booking confirmation tracking
(vs. just the click), this is the column pair to extend.

## Lead tools (dashboard.html, Leads tab)

- **Hot-lead flag** (`isHotLead()`): a decision-maker title (owner/manager/
  director/partner, matched loosely) scoring Critical or Strained overall.
  Shown as 🔥 next to the name; "Hot leads only" toggle filters the table.
  Adjust the title regex or tier condition in one place if the definition
  needs to change.
- **CSV export** (`exportLeadsCsv()`): exports whatever the search/session/
  hot-only filters currently show, client-side (Blob + anchor download), no
  backend involved.

## Storylines (dashboard.html, Trends tab)

`computeStorylines()` auto-surfaces plain-language observations from the
same session/submission data already on the page — e.g. which dimension has
been weakest most often, whether recent sessions are trending up or down.
Thresholds (`sessionSeries.length >= 2` / `>= 4`, `all.length >= 5`) exist so
it doesn't say something confident off 1-2 data points; adjust them if that
feels too conservative or too loose as real data comes in.

## Speaking inquiries

`speak.html` is a separate lead type from practice-owner submissions —
event organizers, not attendees — insert-only for anon, same as
`submissions`. Reviewed from `dashboard.html`'s **Speaking** tab (expandable
rows, mailto reply link). Not yet linked from anywhere in the app on
purpose; decide where you want to point people at it (site nav, LinkedIn
bio, the live screen) and it'll show up here once they submit.

## EmailJS integration

- `CONFIG` keys: `emailPublicKey`, `emailServiceId`, `clientTemplateId`, `ownerTemplateId`,
  plus `ownerEmail` (where lead alerts go) and `bookingLink` (the scorecard CTA).
- On completion, `sendResults()` sends TWO emails via `emailjs.send`, passing these
  template variables: `name`, `email`, `phone`, `title`, `organization`, `practice_type`,
  `overall_score`, `overall_tier`, and for each dimension `<key>_score` / `<key>_tier`,
  plus `booking_link`, `owner_email`, `completed_at`, `to_email`, `reply_to`.
- Each EmailJS template MUST set, in its EmailJS settings, **To Email = `{{to_email}}`**
  and **Reply To = `{{reply_to}}`**. A blank To Email field is the most common cause
  of "no emails arriving."
- Only `emailPublicKey`, `emailServiceId`, `clientTemplateId`, `ownerTemplateId` gate
  whether a send is attempted at all — if any of those four are left at their
  placeholder value, sending is skipped entirely (and `?debug=1` reports it in orange).

## Supabase (dashboard backend) integration

- `index.html`'s `CONFIG.supabaseUrl` / `CONFIG.supabaseAnonKey` gate `saveSubmission()`,
  called alongside `sendResults()` on completion. It's a plain `fetch` POST to
  PostgREST (`/rest/v1/submissions`) — no SDK needed for a single insert.
- `dashboard.html` uses the `@supabase/supabase-js` CDN client for auth (login/logout)
  and queries (`sessions`, `submissions` tables; `get_session_aggregate` and
  `get_global_benchmark` RPCs for the PII-free public Live view).
- RLS (in `supabase-schema.sql`) is the actual security boundary, not the anon key
  being secret — anon can only INSERT into `submissions` and SELECT `sessions` where
  `is_public = true`; reading raw submissions requires an authenticated session.
- `?debug=1` on `index.html` reports save status the same way it reports email status
  (green/orange/red) under the results screen.

## Local testing

- Serve locally: `python3 -m http.server` then open `http://localhost:8000`.
- Append `?debug=1` to `index.html`'s URL to see email + save status printed on
  screen (and richer logs in the browser console).
- With `CONFIG` left at placeholder values, both files still run end to end;
  the email/save steps are simply skipped (or, for `dashboard.html`, a setup
  screen is shown instead of the login).

## Deploy

Any static host. Production target: WordPress at `nathanbushmba.com/assessment`,
uploaded as `public_html/assessment/index.html`, `.../dashboard.html`, and
`.../speak.html`.

## Conventions / guardrails

- Keep each file self-contained. Don't split into modules or introduce a build step.
- No `localStorage` / `sessionStorage` on `index.html` (the attendee app stays
  stateless); `dashboard.html`'s only persisted state is the Supabase auth session,
  managed by `supabase-js` itself.
- Preserve `prefers-reduced-motion` handling (already implemented).
- Keep copy in Nathan's voice: direct, insight-driven, lightly contrarian, no hype.
