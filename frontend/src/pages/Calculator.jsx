import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api, formatIDR, formatApiErrorDetail } from "@/lib/api";
import { Calculator as CalcIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Calculator() {
    const [catalog, setCatalog] = useState([]);
    const [deviceType, setDeviceType] = useState("smartphone");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [damage, setDamage] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/catalog").then((r) => setCatalog(r.data.catalog));
    }, []);

    const brands = catalog.filter((b) => b.device_type === deviceType);
    const currentBrand = brands.find((b) => b.brand === brand);
    const models = currentBrand?.models || [];
    const damages = currentBrand?.damages || [];

    const estimate = async () => {
        if (!brand || !model || !damage) {
            toast.error("Lengkapi pilihan perangkat & kerusakan");
            return;
        }
        setLoading(true);
        try {
            const { data } = await api.post("/estimate", {
                device_type: deviceType, brand, model, damage,
            });
            setResult(data);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 md:pb-0" data-testid="calculator-page">
            <Navbar />
            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f97316] text-white">
                        <CalcIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                            Cost Calculator
                        </div>
                        <h1 className="font-display text-3xl font-black text-[#0a192f]">
                            Hitung biaya perbaikan instan
                        </h1>
                    </div>
                </div>
                <p className="mt-3 max-w-xl text-slate-600">
                    Pilih perangkat dan jenis kerusakan untuk mendapatkan estimasi harga yang
                    transparan sebelum datang.
                </p>

                <div className="mt-8 grid gap-6 md:grid-cols-5">
                    <div className="md:col-span-3 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="space-y-5">
                            <div>
                                <Label>Jenis Perangkat</Label>
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    {["smartphone", "tv"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                setDeviceType(t);
                                                setBrand("");
                                                setModel("");
                                                setDamage("");
                                                setResult(null);
                                            }}
                                            data-testid={`calc-devicetype-${t}`}
                                            className={`rounded-xl border-2 p-3 text-sm font-semibold transition-all ${
                                                deviceType === t
                                                    ? "border-[#f97316] bg-orange-50 text-[#0a192f]"
                                                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                                            }`}
                                        >
                                            {t === "smartphone" ? "Smartphone / HP" : "TV"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Brand</Label>
                                <Select
                                    value={brand}
                                    onValueChange={(v) => {
                                        setBrand(v);
                                        setModel("");
                                        setDamage("");
                                        setResult(null);
                                    }}
                                >
                                    <SelectTrigger className="mt-1.5" data-testid="calc-brand">
                                        <SelectValue placeholder="Pilih brand" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((b) => (
                                            <SelectItem key={b.brand} value={b.brand}>
                                                {b.brand}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Model</Label>
                                <Select value={model} onValueChange={setModel} disabled={!brand}>
                                    <SelectTrigger className="mt-1.5" data-testid="calc-model">
                                        <SelectValue placeholder="Pilih model / ukuran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {models.map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Jenis Kerusakan</Label>
                                <Select value={damage} onValueChange={setDamage} disabled={!brand}>
                                    <SelectTrigger className="mt-1.5" data-testid="calc-damage">
                                        <SelectValue placeholder="Pilih kerusakan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {damages.map((d) => (
                                            <SelectItem key={d.key} value={d.key}>
                                                {d.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                onClick={estimate}
                                disabled={loading}
                                className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                                data-testid="calc-submit"
                            >
                                {loading ? "Menghitung..." : "Hitung Estimasi"}
                            </Button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        {result ? (
                            <div
                                data-testid="calc-result"
                                className="fade-up rounded-2xl bg-[#0a192f] p-6 text-white shadow-xl"
                            >
                                <div className="flex items-center gap-2 text-[#f97316]">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="text-xs font-bold uppercase tracking-[0.25em]">
                                        Estimasi Biaya
                                    </span>
                                </div>
                                <div className="mt-4 font-mono-brand text-sm text-slate-300">
                                    {result.brand} • {result.model}
                                </div>
                                <div className="text-sm text-slate-300">{result.damage}</div>
                                <div className="mt-6 border-t border-white/10 pt-5">
                                    <div className="text-xs uppercase tracking-widest text-slate-400">
                                        Kisaran Harga
                                    </div>
                                    <div className="mt-2 font-display text-3xl font-black">
                                        {formatIDR(result.estimate_min)} –{" "}
                                        {formatIDR(result.estimate_max)}
                                    </div>
                                </div>
                                <p className="mt-4 text-xs text-slate-400">{result.note}</p>
                                <Link to="/booking">
                                    <Button className="mt-5 w-full bg-[#f97316] text-white hover:bg-[#ea580c]" data-testid="calc-to-booking">
                                        Lanjut Booking
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                                Isi form untuk melihat estimasi biaya transparan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
            <StickyMobileCTA />
        </div>
    );
}
