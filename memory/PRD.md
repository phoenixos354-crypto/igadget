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
- Digital Diagnostic Report (itemized cost)
- Public tracking via kode `IGS-XXXXXX`
- Admin dashboard (Kelola booking + update status + diagnostic)
- Landing trust-building + Blog edukasi
- Mobile-first + sticky CTA mobile

## Implemented (v1 — 2026-04-20)
- [x] Auth JWT (register / login / logout / me) dengan bcrypt + httpOnly cookies + Bearer fallback
- [x] Admin seed otomatis + idempotent
- [x] Catalog API (Apple/Samsung/Xiaomi/Oppo + TV Samsung/LG/Sony) dengan harga base
- [x] POST /api/estimate (kisaran 0.9×–1.15× base)
- [x] Booking CRUD + timeline + estimate dengan service_fee
- [x] Public tracking by `IGS-XXXXXX`
- [x] Admin: list / stats / update status / put diagnostic
- [x] Frontend: Landing, Calculator, Booking Wizard 3-step, Track, Dashboard, BookingDetail, Admin Control Room, Blog
- [x] StatusTimeline component dengan pulse animation
- [x] Sticky mobile CTA
- [x] Tested: 100% backend (25/25) & frontend flows passed

## Backlog / Next Actions
### P0
- [ ] Real WhatsApp notification (Twilio/WaBot) — saat ini tidak ada notifikasi
- [ ] RajaOngkir / Lalamove integrasi untuk Pickup & Delivery estimasi ongkir real
### P1
- [ ] Brute-force lockout pada login (5 fails → 15 min)
- [ ] Password reset flow (email/link)
- [ ] Upload foto perangkat + foto before/after di diagnostic report (object storage)
- [ ] Schema markup LocalBusiness untuk SEO
- [ ] PWA / manifest + service worker
### P2
- [ ] Review & rating pelanggan setelah completed
- [ ] Sistem loyalty / voucher
- [ ] Blog CMS (sekarang static)
- [ ] Multi-cabang support
- [ ] Technician assignment & scheduling

## Test Credentials
Lihat `/app/memory/test_credentials.md`
