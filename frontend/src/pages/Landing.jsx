import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import {
    ShieldCheck,
    Eye,
    Truck,
    Home,
    Store,
    Calculator as CalcIcon,
    ArrowRight,
    Sparkles,
    Clock,
    Award,
    Smartphone,
    Tv,
    Wrench,
    Check,
} from "lucide-react";

const HERO_IMG =
    "https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&w=1600";
const TV_IMG = "https://images.unsplash.com/photo-1774301266018-57c0b190ed43?w=1200";
const MOBILE_IMG =
    "https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&w=1200";
const TRUST_IMG =
    "https://images.pexels.com/photos/7709180/pexels-photo-7709180.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function Landing() {
    return (
        <div className="min-h-screen bg-white pb-24 md:pb-0" data-testid="landing-page">
            <Navbar />

            {/* Hero */}
            <section className="relative overflow-hidden">
                <div
                    className="absolute inset-0 -z-10 bg-cover bg-center opacity-20"
                    style={{ backgroundImage: `url(${HERO_IMG})` }}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white via-white/90 to-white/40" />
                <div className="bg-grain absolute inset-0 -z-10 opacity-50" />

                <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-20 md:grid-cols-12 md:pt-24 md:pb-28">
                    <div className="md:col-span-7 fade-up">
                        <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">
                            <Sparkles className="h-3.5 w-3.5" /> Trusted in Bojonegoro
                        </div>
                        <h1 className="mt-6 font-display text-4xl font-black leading-[1.05] text-[#0a192f] sm:text-5xl lg:text-6xl">
                            Profesionalisme di setiap{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10">sentuhan.</span>
                                <span className="absolute bottom-1 left-0 right-0 -z-0 h-3 bg-[#f97316]/40" />
                            </span>
                        </h1>
                        <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                            Perbaiki HP &amp; TV Anda dengan transparansi 100% — lihat langsung
                            teknisi kami bekerja. Estimasi biaya instan, tracking real-time, dan
                            layanan jemput-antar tanpa ribet.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/booking">
                                <Button
                                    size="lg"
                                    className="bg-[#f97316] text-white shadow-lg shadow-orange-500/30 hover:bg-[#ea580c]"
                                    data-testid="hero-book-btn"
                                >
                                    Amankan Slot Booking Anda
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/calculator">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-2 border-slate-200"
                                    data-testid="hero-calc-btn"
                                >
                                    <CalcIcon className="mr-2 h-4 w-4" /> Hitung Biaya Instan
                                </Button>
                            </Link>
                        </div>

                        <div className="mt-10 grid grid-cols-3 gap-4 md:max-w-lg">
                            {[
                                { n: "5.000+", l: "Perangkat Ditangani" },
                                { n: "4.9★", l: "Rating Pelanggan" },
                                { n: "100%", l: "Transparan" },
                            ].map((s) => (
                                <div key={s.l} className="border-l-2 border-[#f97316] pl-3">
                                    <div className="font-display text-2xl font-black text-[#0a192f]">
                                        {s.n}
                                    </div>
                                    <div className="text-xs text-slate-500">{s.l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-5 fade-up" style={{ animationDelay: "0.15s" }}>
                        <div className="glass-card relative rounded-3xl p-6 shadow-xl">
                            <img
                                src={HERO_IMG}
                                alt="technician"
                                className="h-64 w-full rounded-2xl object-cover"
                            />
                            <div className="mt-5 space-y-3">
                                {[
                                    { i: ShieldCheck, t: "Garansi service hingga 30 hari" },
                                    { i: Eye, t: "Transparansi face-to-face (lihat teknisi bekerja)" },
                                    { i: Clock, t: "Diagnosa kilat dalam 15 menit" },
                                ].map((row) => (
                                    <div key={row.t} className="flex items-center gap-3 text-sm">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0a192f] text-[#f97316]">
                                            <row.i className="h-4 w-4" />
                                        </div>
                                        <span className="font-medium text-[#0a192f]">{row.t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="mx-auto max-w-7xl px-6 py-20" data-testid="services-section">
                <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                            Layanan Kami
                        </div>
                        <h2 className="mt-3 font-display text-3xl font-black text-[#0a192f] sm:text-4xl">
                            Pilih cara paling nyaman untuk Anda
                        </h2>
                    </div>
                    <p className="max-w-md text-slate-600">
                        Tiga opsi layanan, satu janji: perbaikan cepat, transparan, dan tanpa ribet.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        {
                            i: Store,
                            t: "Service On Store",
                            d: "Datang langsung ke toko kami. Booking slot waktu agar tanpa antrean.",
                            img: TRUST_IMG,
                        },
                        {
                            i: Truck,
                            t: "Pickup & Delivery",
                            d: "Jemput & antar gadget Anda ke rumah. Estimasi ongkir di muka.",
                            img: MOBILE_IMG,
                        },
                        {
                            i: Home,
                            t: "Home Service",
                            d: "Teknisi datang ke rumah untuk TV & perangkat besar. Area Bojonegoro.",
                            img: TV_IMG,
                        },
                    ].map((c, i) => (
                        <div
                            key={c.t}
                            className="hover-lift group overflow-hidden rounded-2xl border border-slate-100 bg-white"
                            data-testid={`service-card-${i}`}
                        >
                            <div className="relative h-40 overflow-hidden">
                                <img
                                    src={c.img}
                                    alt={c.t}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a192f]/80 to-transparent" />
                                <div className="absolute bottom-3 left-4 flex items-center gap-2 text-white">
                                    <c.i className="h-5 w-5 text-[#f97316]" />
                                    <span className="font-display text-xl font-bold">{c.t}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <p className="text-sm leading-relaxed text-slate-600">{c.d}</p>
                                <Link
                                    to="/booking"
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f97316] hover:gap-2 transition-all"
                                >
                                    Booking layanan ini <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* How it works */}
            <section className="bg-slate-50 py-20" data-testid="how-section">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="mb-12 text-center">
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                            Alur Kerja
                        </div>
                        <h2 className="mt-3 font-display text-3xl font-black text-[#0a192f] sm:text-4xl">
                            5 Langkah Perbaikan yang Terlacak
                        </h2>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                        {[
                            "Diterima",
                            "Diagnosa",
                            "Dikerjakan",
                            "Testing",
                            "Siap Diambil",
                        ].map((step, i) => (
                            <div
                                key={step}
                                className="relative rounded-xl border border-slate-200 bg-white p-5"
                            >
                                <div className="font-mono-brand text-xs font-bold text-[#f97316]">
                                    STEP 0{i + 1}
                                </div>
                                <div className="mt-2 font-display text-lg font-bold text-[#0a192f]">
                                    {step}
                                </div>
                                <div className="mt-2 text-xs text-slate-500">
                                    Notifikasi real-time di setiap tahap.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why us */}
            <section className="mx-auto max-w-7xl px-6 py-20" data-testid="why-section">
                <div className="grid gap-10 md:grid-cols-2">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                            Kenapa iGadget
                        </div>
                        <h2 className="mt-3 font-display text-3xl font-black text-[#0a192f] sm:text-4xl">
                            Zero Hassle. 100% Transparent.
                        </h2>
                        <p className="mt-4 max-w-md text-slate-600">
                            Kami hadir untuk mengikis kekhawatiran Anda tentang "teknisi nakal".
                            Proses kami terbuka, bisa dilihat langsung, dan terdokumentasi digital.
                        </p>

                        <ul className="mt-8 space-y-4">
                            {[
                                "Digital Diagnostic Report — rincian jujur setiap kerusakan",
                                "Live Repair Tracking — pantau dari manapun",
                                "Data pelanggan aman — SOP keamanan ketat",
                                "Cost Calculator — tahu harga sebelum datang",
                            ].map((row) => (
                                <li key={row} className="flex items-start gap-3">
                                    <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#f97316] text-white">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-sm font-medium text-[#0a192f]">
                                        {row}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="relative">
                        <img
                            src={TRUST_IMG}
                            alt="customer service"
                            className="h-[420px] w-full rounded-3xl object-cover"
                        />
                        <div className="absolute -bottom-6 -left-4 rounded-2xl bg-[#0a192f] p-5 text-white shadow-xl md:-left-8">
                            <div className="flex items-center gap-3">
                                <Award className="h-8 w-8 text-[#f97316]" />
                                <div>
                                    <div className="font-display text-2xl font-bold">30 Hari</div>
                                    <div className="text-xs text-slate-300">Garansi Service</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Device Types CTA */}
            <section className="mx-auto max-w-7xl px-6 pb-20">
                <div className="grid gap-6 md:grid-cols-2">
                    {[
                        { i: Smartphone, t: "Service Smartphone", d: "iPhone, Samsung, Xiaomi, Oppo & lainnya" },
                        { i: Tv, t: "Service TV", d: "LED, QLED, OLED — semua merk & ukuran" },
                    ].map((c) => (
                        <div
                            key={c.t}
                            className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6"
                        >
                            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0a192f] text-[#f97316]">
                                <c.i className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                                <div className="font-display text-xl font-bold text-[#0a192f]">
                                    {c.t}
                                </div>
                                <div className="text-sm text-slate-500">{c.d}</div>
                            </div>
                            <Link to="/calculator">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-2"
                                    data-testid={`device-${c.t}-cta`}
                                >
                                    Cek Biaya
                                </Button>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Banner */}
            <section className="mx-auto max-w-7xl px-6 pb-24">
                <div className="relative overflow-hidden rounded-3xl bg-[#0a192f] px-8 py-14 md:px-14">
                    <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#f97316]/20 blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-[#f97316]/10 blur-3xl" />
                    <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                                Siap Perbaiki?
                            </div>
                            <h3 className="mt-3 max-w-xl font-display text-3xl font-black text-white sm:text-4xl">
                                Jemput gadget Anda sekarang — tanpa antrean, tanpa ribet.
                            </h3>
                        </div>
                        <div className="flex gap-3">
                            <Link to="/booking">
                                <Button
                                    size="lg"
                                    className="bg-[#f97316] text-white hover:bg-[#ea580c]"
                                    data-testid="cta-banner-book"
                                >
                                    Jemput Gadget Sekarang
                                </Button>
                            </Link>
                            <Link to="/track">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 bg-transparent text-white hover:bg-white/10"
                                    data-testid="cta-banner-track"
                                >
                                    Lacak Perbaikan Saya
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
            <StickyMobileCTA />
        </div>
    );
}
