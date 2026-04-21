# PRD — iGadget Service Bojonegoro

## Original Problem Statement
Next-Gen Repair Platform untuk HP & TV. Mengikis "teknisi nakal" via transparansi face-to-face + layanan jemput-antar. Value: "Professional Repair, Transparent Process, Zero Hassle."

## Stack
- Backend: FastAPI + MongoDB (Motor)
- Frontend: React 19 + Tailwind + shadcn/ui + sonner
- Auth: JWT (bcrypt, httpOnly cookies + Bearer fallback)
- Fonts: Outfit (display) + Manrope (body) + JetBrains Mono
- Palette: Midnight Blue `#0A192F` / Accent Orange `#F97316`

## Personas
- **Pelanggan**: Pengguna HP/TV di Bojonegoro yang ingin booking cepat & transparan
- **Admin/Teknisi**: Staf toko yang mengelola booking & meng-upload diagnostic

## Core Requirements (static)
- Booking Engine 3 mode (On Store, Pickup & Delivery, Home Service)
- Cost Calculator (brand × model × kerusakan → estimasi)
- Live Repair Tracking 5 tahap (Received → Diagnosed → Repairing → Testing → Ready)
- Digital Diagnostic Report (itemized cost + foto before/after)
- Public tracking via kode `IGS-XXXXXX`
- Admin dashboard (Kelola booking + update status + diagnostic)
- Landing trust-building + Blog edukasi
- Mobile-first + sticky CTA mobile
- SEO LocalBusiness + PWA

## Implemented v1 — 2026-04-20
- Auth JWT (register/login/logout/me) + admin seed
- Catalog, cost estimator, booking CRUD + timeline + estimate dengan service_fee
- Public tracking by `IGS-XXXXXX`
- Admin: list/stats/update status/put diagnostic
- Frontend 9 pages + StatusTimeline + Sticky mobile CTA
- Testing: 100% pass (25/25 backend + all frontend flows)

## Implemented v2 — 2026-04-21
- **Ongkir integration** via RapidAPI `cek-resi-cek-ongkir`:
  - `/api/ongkir/autocomplete?q=` → live area search (working)
  - `/api/ongkir/estimate` → shipping cost with graceful fallback (provider shipping-cost endpoint returns 500 consistently, fallback gives flat 15K–45K)
  - UI integrasi di Booking Wizard step 3 untuk Pickup & Delivery
- **Object storage (Emergent)** untuk foto before/after Diagnostic Report:
  - `/api/admin/bookings/{id}/diagnostic/photos?kind=before|after` upload (max 8MB, jpg/png/webp)
  - `/api/files/{path}` auth-protected serve (Bearer header OR `?auth=` query for `<img>`)
  - UI upload + grid thumbnail di Admin dialog, galeri di Diagnostic report
- **Brute-force lockout**: 5 gagal / 15 menit (pakai `X-Forwarded-For` agar bekerja di balik ingress)
- **Password reset**: `/api/auth/forgot-password` + `/api/auth/reset-password` + UI `/forgot-password` + `/reset-password?token=`
- **SEO + PWA**: JSON-LD `LocalBusiness` (rating, areaServed, openingHours), `manifest.json`, OG tags, title iGadget-branded
- Testing: 100% retest pass

## Backlog / Next Actions
### P0
- [ ] Real WhatsApp notification (Twilio/WaBot) saat status booking berubah
- [ ] Review & rating + share-card pelanggan setelah completed (acquisition loop)
### P1
- [ ] Shadcn Calendar (DD/MM/YYYY) menggantikan native date input di Booking step 3
- [ ] Email sender nyata untuk forgot-password (sekarang log-only)
- [ ] Provider ongkir cadangan (RajaOngkir/Komerce) karena provider utama sering 500
- [ ] Modularisasi server.py (auth/bookings/ongkir/files routers)
### P2
- [ ] Sistem loyalty / voucher
- [ ] Multi-cabang + technician assignment
- [ ] Blog CMS (sekarang static)

## Test Credentials
Lihat `/app/memory/test_credentials.md`
