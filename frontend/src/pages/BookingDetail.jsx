import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusTimeline from "@/components/StatusTimeline";
import { DiagnosticCard } from "@/pages/Track";
import { api, formatIDR } from "@/lib/api";
import { ArrowLeft, Phone, MapPin, Calendar } from "lucide-react";

const SERVICE_LABEL = {
    on_store: "Service On Store",
    pickup_delivery: "Pickup & Delivery",
    home_service: "Home Service",
};

export default function BookingDetail() {
    const { id } = useParams();
    const [b, setB] = useState(null);

    useEffect(() => {
        api.get(`/bookings/${id}`).then((r) => setB(r.data));
    }, [id]);

    if (!b) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <div className="mx-auto max-w-4xl px-6 py-20 text-center text-slate-400">
                    Memuat detail booking...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50" data-testid="booking-detail-page">
            <Navbar />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[#0a192f]"
                >
                    <ArrowLeft className="h-4 w-4" /> Dasbor
                </Link>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="font-mono-brand text-xs font-bold text-[#f97316]">
                                {b.tracking_code}
                            </div>
                            <div className="mt-1 font-display text-2xl font-black text-[#0a192f]">
                                {b.brand} {b.model}
                            </div>
                            <div className="text-sm text-slate-500">
                                {b.damage_label} • {SERVICE_LABEL[b.service_type]}
                            </div>
                        </div>
                        <div className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f97316]">
                            {b.current_status.replace("_", " ")}
                        </div>
                    </div>

                    <div className="mt-8">
                        <StatusTimeline currentStatus={b.current_status} timeline={b.timeline} />
                    </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                            Detail Pelanggan
                        </div>
                        <div className="mt-3 space-y-2 text-sm">
                            <div className="font-semibold text-[#0a192f]">{b.customer_name}</div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Phone className="h-4 w-4 text-slate-400" />
                                {b.customer_phone}
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {b.scheduled_date} • {b.scheduled_time}
                            </div>
                            {b.address && (
                                <div className="flex items-start gap-2 text-slate-600">
                                    <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                                    {b.address}, {b.city}
                                </div>
                            )}
                            {b.description && (
                                <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                                    {b.description}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-[#0a192f] p-6 text-white">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                            Estimasi Biaya
                        </div>
                        <div className="mt-2 font-display text-2xl font-black">
                            {formatIDR(b.estimate_min)} – {formatIDR(b.estimate_max)}
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                            {b.service_fee > 0 && `Termasuk biaya layanan ${formatIDR(b.service_fee)}.`}
                            {" "}Harga final setelah diagnosa.
                        </div>
                    </div>
                </div>

                {b.diagnostic && (
                    <div className="mt-6">
                        <DiagnosticCard d={b.diagnostic} />
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}
