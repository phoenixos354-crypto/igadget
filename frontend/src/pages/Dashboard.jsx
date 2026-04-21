import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { api, formatIDR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { PackageSearch, Plus, ArrowRight } from "lucide-react";

const STATUS_CHIP = {
    received: "bg-blue-50 text-blue-700",
    diagnosed: "bg-purple-50 text-purple-700",
    repairing: "bg-orange-50 text-orange-700",
    testing: "bg-yellow-50 text-yellow-700",
    ready: "bg-green-50 text-green-700",
    completed: "bg-slate-100 text-slate-600",
    cancelled: "bg-red-50 text-red-700",
};

export default function Dashboard() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        api.get("/bookings/my").then((r) => setBookings(r.data));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50" data-testid="dashboard-page">
            <Navbar />
            <div className="mx-auto max-w-5xl px-6 py-12">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                            Dasbor Saya
                        </div>
                        <h1 className="mt-2 font-display text-3xl font-black text-[#0a192f]">
                            Halo, {user?.name?.split(" ")[0]}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Kelola dan pantau semua perbaikan Anda di satu tempat.
                        </p>
                    </div>
                    <Link to="/booking">
                        <Button className="bg-[#f97316] text-white hover:bg-[#ea580c]" data-testid="dashboard-new-booking">
                            <Plus className="mr-2 h-4 w-4" /> Booking Baru
                        </Button>
                    </Link>
                </div>

                <div className="mt-10">
                    {bookings.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                            <PackageSearch className="mx-auto h-12 w-12 text-slate-300" />
                            <div className="mt-4 font-display text-lg font-bold text-[#0a192f]">
                                Belum ada perbaikan
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                                Mulai booking perbaikan pertama Anda.
                            </p>
                            <Link to="/booking">
                                <Button className="mt-5 bg-[#f97316] text-white hover:bg-[#ea580c]">
                                    Buat Booking
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((b) => (
                                <Link
                                    key={b.id}
                                    to={`/bookings/${b.id}`}
                                    data-testid={`booking-card-${b.id}`}
                                    className="hover-lift block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="font-mono-brand text-xs font-bold text-[#f97316]">
                                                {b.tracking_code}
                                            </div>
                                            <div className="mt-1 font-display text-lg font-bold text-[#0a192f]">
                                                {b.brand} {b.model}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {b.damage_label}
                                            </div>
                                            <div className="mt-2 text-xs text-slate-400">
                                                Jadwal: {b.scheduled_date} • {b.scheduled_time}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div
                                                className={`inline-block rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wider ${STATUS_CHIP[b.current_status] || "bg-slate-100"}`}
                                            >
                                                {b.current_status.replace("_", " ")}
                                            </div>
                                            <div className="mt-2 text-sm font-semibold text-[#0a192f]">
                                                {formatIDR(b.estimate_min)} – {formatIDR(b.estimate_max)}
                                            </div>
                                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-[#f97316]">
                                                Detail <ArrowRight className="h-3 w-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}
