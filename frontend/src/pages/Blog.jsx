import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const ARTICLES = [
    {
        t: "5 Tanda LCD HP Anda Harus Segera Diganti",
        e: "Garis vertikal, layar berkedip, atau area mati sering menjadi indikator LCD sudah bermasalah.",
        tag: "Smartphone",
        img: "https://images.pexels.com/photos/6755075/pexels-photo-6755075.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        t: "Cara Merawat TV agar Awet hingga 10 Tahun",
        e: "Kurangi overheat, bersihkan ventilasi, dan hindari voltase tidak stabil — 3 pilar umur panjang TV.",
        tag: "TV",
        img: "https://images.unsplash.com/photo-1774301266018-57c0b190ed43?w=1200",
    },
    {
        t: "Baterai HP Cepat Habis? Cek 4 Penyebab Ini",
        e: "Bukan hanya soal baterai. Kadang masalahnya ada di charger, software, atau kebiasaan mengisi.",
        tag: "Smartphone",
        img: "https://images.pexels.com/photos/6754839/pexels-photo-6754839.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
    {
        t: "Hati-hati Teknisi Nakal: Checklist Sebelum Service",
        e: "Minta diagnostic report, catat kerusakan dengan foto, dan pastikan garansi tertulis.",
        tag: "Tips",
        img: "https://images.pexels.com/photos/7709180/pexels-photo-7709180.jpeg?auto=compress&cs=tinysrgb&w=1200",
    },
];

export default function Blog() {
    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0" data-testid="blog-page">
            <Navbar />
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                    Edukasi
                </div>
                <h1 className="mt-2 font-display text-3xl font-black text-[#0a192f] sm:text-4xl">
                    Tips merawat & memperbaiki gadget
                </h1>
                <p className="mt-2 max-w-xl text-slate-600">
                    Artikel singkat dari teknisi berpengalaman — agar Anda lebih cerdas dalam
                    merawat perangkat.
                </p>

                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {ARTICLES.map((a) => (
                        <article
                            key={a.t}
                            className="hover-lift overflow-hidden rounded-2xl border border-slate-100 bg-white"
                        >
                            <img src={a.img} alt={a.t} className="h-48 w-full object-cover" />
                            <div className="p-5">
                                <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                                    {a.tag}
                                </div>
                                <h3 className="mt-2 font-display text-xl font-bold text-[#0a192f]">
                                    {a.t}
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">{a.e}</p>
                                <Link
                                    to="/booking"
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#f97316] hover:gap-2 transition-all"
                                >
                                    Butuh perbaikan? <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
            <Footer />
            <StickyMobileCTA />
        </div>
    );
}
