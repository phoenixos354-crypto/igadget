import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import StatusTimeline from "@/components/StatusTimeline";
import { api, formatIDR, formatApiErrorDetail } from "@/lib/api";
import { Search, FileText } from "lucide-react";
import { toast } from "sonner";

const SERVICE_LABEL = {
    on_store: "Service On Store",
    pickup_delivery: "Pickup & Delivery",
    home_service: "Home Service",
};

export default function Track() {
    const { code: paramCode } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState(paramCode || "");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const lookup = async (c) => {
        const v = (c || code).trim().toUpperCase();
        if (!v) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/track/${v}`);
            setData(data);
        } catch (e) {
            setData(null);
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (paramCode) lookup(paramCode);
        // eslint-disable-next-line
    }, [paramCode]);

    return (
        <div className="min-h-screen bg-slate-50" data-testid="track-page">
            <Navbar />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                    Live Repair Tracking
                </div>
                <h1 className="mt-2 font-display text-3xl font-black text-[#0a192f]">
                    Lacak perbaikan Anda
                </h1>

                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            placeholder="Masukkan kode tracking (IGS-XXXXXX)"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && lookup()}
                            className="uppercase"
                            data-testid="track-input"
                        />
                        <Button
                            onClick={() => {
                                navigate(`/track/${code.trim().toUpperCase()}`);
                                lookup();
                            }}
                            disabled={loading || !code.trim()}
                            className="bg-[#f97316] text-white hover:bg-[#ea580c]"
                            data-testid="track-submit"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Lacak
                        </Button>
                    </div>
                </div>

                {data && (
                    <div className="mt-8 space-y-6 fade-up" data-testid="track-result">
                        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="font-mono-brand text-xs font-bold text-[#f97316]">
                                        {data.tracking_code}
                                    </div>
                                    <div className="mt-1 font-display text-xl font-bold text-[#0a192f]">
                                        {data.brand} {data.model}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {data.damage_label} • {SERVICE_LABEL[data.service_type]}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#f97316]">
                                    {data.current_status.replace("_", " ")}
                                </div>
                            </div>
                            <div className="mt-8">
                                <StatusTimeline
                                    currentStatus={data.current_status}
                                    timeline={data.timeline}
                                />
                            </div>
                        </div>

                        {data.diagnostic && (
                            <DiagnosticCard d={data.diagnostic} />
                        )}

                        <div className="rounded-2xl bg-[#0a192f] p-6 text-white">
                            <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                                Estimasi Biaya
                            </div>
                            <div className="mt-2 font-display text-2xl font-black">
                                {formatIDR(data.estimate_min)} – {formatIDR(data.estimate_max)}
                            </div>
                            <div className="text-xs text-slate-400">
                                Harga final mengikuti Digital Diagnostic Report.
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export function DiagnosticCard({ d }) {
    return (
        <div
            data-testid="diagnostic-report"
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#f97316]" />
                <div className="font-display text-lg font-bold text-[#0a192f]">
                    Digital Diagnostic Report
                </div>
            </div>
            <div className="mt-4 space-y-3 text-sm">
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Masalah
                    </div>
                    <div className="mt-1 text-[#0a192f]">{d.problem_summary}</div>
                </div>
                <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Temuan Teknisi
                    </div>
                    <div className="mt-1 text-slate-600">{d.findings}</div>
                </div>
            </div>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                    Rincian Biaya
                </div>
                <ul className="mt-3 divide-y divide-slate-200 text-sm">
                    {d.items.map((it, i) => (
                        <li key={i} className="flex items-center justify-between py-2">
                            <span>{it.label}</span>
                            <span className="font-mono-brand font-semibold text-[#0a192f]">
                                {formatIDR(it.price)}
                            </span>
                        </li>
                    ))}
                    {d.labor_cost > 0 && (
                        <li className="flex items-center justify-between py-2">
                            <span>Jasa / Labor</span>
                            <span className="font-mono-brand font-semibold text-[#0a192f]">
                                {formatIDR(d.labor_cost)}
                            </span>
                        </li>
                    )}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-slate-300 pt-3">
                    <span className="font-bold text-[#0a192f]">Total</span>
                    <span className="font-display text-xl font-black text-[#f97316]">
                        {formatIDR(d.total)}
                    </span>
                </div>
            </div>
            {d.notes && (
                <div className="mt-4 text-xs text-slate-500">Catatan: {d.notes}</div>
            )}
            <div className="mt-3 text-xs text-slate-400">
                Teknisi: <span className="font-semibold text-[#0a192f]">{d.technician}</span>
            </div>
        </div>
    );
}
