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
- Login is e-mail + password (Supabase Auth). New accounts need `perfis.aprovado = true`, set only in the database. Password reset by e-mail link.
- Payment is Pix via Mercado Pago, confirmed by webhook + checkout polling.
- Admin pages (only profiles with `perfis.is_admin = true`): overview, sessions (create, upload photos, toggle online/offline, delete unsold photos), users, transactions.

## Capabilities and Constraints
- Next.js 14 app router, Tailwind.
- Backend is Supabase only: Auth, Postgres, Storage (public `previews`, private `originais`). The offline demo mode was retired by the user on 2026-11-07.
- Copy is in Brazilian Portuguese.

## Brand Commitments
- Name: Fottu. The previous visual style (ocean/sand/coral, "ticket" card) is retired by the user's choice; keep the name.

## Evidence on Hand
No real photos, testimonials or contact details in the repo. Do not fabricate them.

## Product Principles
- Photos first: the buyer is looking for themselves, so imagery leads and chrome recedes.
- Trust before payment: clear prices, clear preview vs. original, and a clear order state.
- Few steps: select, pay, download.
