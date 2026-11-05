# Fly.io billing cleanup — 2026-11-05

## Summary

An unexpected Fly.io charge of **USD 12.29** turned up. It came from **goldcloud**, an
old app that was no longer in use and was the only app on the Fly.io account. goldcloud
was deleted on 2026-11-05.

## What was found

- **Fly.io account:** personal org `liam-strickland`, pay-as-you-go plan, member since
  Aug 19, 2025.
- **App:** `goldcloud` — 1 machine in `jnb` (Johannesburg), no volumes, last deployed about
  a year earlier.
- **Invoice OMFQZ0VJ-0015 (Oct 1 – Nov 1, 2026): $12.29**, a single line item:
  *Machines Performance CPU 2x (jnb)*.
- **Every earlier month back to at least March 2026 was $0.00.** The previous non-zero bill
  was USD 6.11 on 2 Oct 2025.

## Likely cause

A Performance 2x machine costs roughly $60+/month if it runs nonstop, so $12.29 is only
about 5–6 days of runtime. The most likely explanation is that the machine was stopped,
with Fly set to start it on an incoming request. Some traffic in October (a bot, a crawler
or a real visitor) woke it, and it ran for a few days.

This could not be confirmed. The app's metrics and logs were removed when it was deleted,
and the org Activity page only lists members and tokens.

## Actions taken

1. Deleted the `goldcloud` app from the Fly dashboard (Settings → Delete app). Fly
   confirmed: "goldcloud successfully deleted".
2. Checked for other resources that Fly bills separately. None remain:
   - Managed Postgres: none
   - Upstash Redis (via Fly): none
   - Tigris object storage: no buckets. The Tigris terms-of-service prompt was **not**
     accepted.

## Follow-up

- The next invoice (November 2026) may include a small charge for Nov 1–5, before the
  deletion. After that it should be $0.
- To rule out any further charges, the saved card can be removed through the Stripe
  billing portal linked from Fly → Billing.
- Lesson: when retiring a side project on a usage-billed host, delete the app instead of
  leaving a stopped machine. A stopped machine can be started again by incoming traffic.
