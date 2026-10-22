# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
People the photographer has photographed at a session (a place + date). They come to find themselves in the session's photos and buy their own pictures. Secondary user: the photographer/admin, who publishes sessions and follows sales.

## Product Purpose
Fottu is a photo marketplace run by the photographer. Buyers browse sessions, preview low-res watermarked photos, select theirs, pay via Pix, and download the high-resolution originals. Success: a buyer finds their photos quickly and completes the purchase without friction.

## Operating Context
- Sessions ("anúncios") are identified by title, location and date; each photo has a short code (e.g. "020A7197") shown to the buyer.
- Login is passwordless: e-mail + 6-digit code.
- Payment is Pix (Mercado Pago in production).
- Admin pages: overview, sessions (toggle online/offline), users, transactions.

## Capabilities and Constraints
- Next.js 14 app router, Tailwind.
- Must run fully offline with no database and no `.env`: in-memory demo data, login code shown on screen, simulated Pix payment, local downloads. (Confirmed by the user, 2026-10-21.)
- Copy is in Brazilian Portuguese.

## Brand Commitments
- Name: Fottu. The previous visual style (ocean/sand/coral, "ticket" card) is retired by the user's choice; keep the name.

## Evidence on Hand
No real photos, testimonials or contact details in the repo. Do not fabricate them; demo imagery is generated placeholders.

## Product Principles
- Photos first: the buyer is looking for themselves, so imagery leads and chrome recedes.
- Trust before payment: clear prices, clear preview vs. original, and a clear order state.
- Few steps: select, pay, download.
