import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { api, formatIDR, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Store, Truck, Home, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const SERVICE_OPTIONS = [
    { key: "on_store", label: "Service On Store", icon: Store, desc: "Datang ke toko, tanpa antrean" },
    { key: "pickup_delivery", label: "Pickup & Delivery", icon: Truck, desc: "Jemput + antar + ongkir transparan" },
    { key: "home_service", label: "Home Service", icon: Home, desc: "Teknisi datang ke rumah" },
];

export default function Booking() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [catalog, setCatalog] = useState([]);
    const [fees, setFees] = useState({});
    const [step, setStep] = useState(1);
    const [f, setF] = useState({
        service_type: "on_store",
        device_type: "smartphone",
        brand: "",
        model: "",
        damage: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "09:00",
        customer_name: "",
        customer_phone: "",
        address: "",
        city: "Bojonegoro",
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/catalog").then((r) => {
            setCatalog(r.data.catalog);
            setFees(r.data.service_fees);
        });
    }, []);

    useEffect(() => {
        if (user && typeof user === "object") {
            setF((s) => ({
                ...s,
                customer_name: s.customer_name || user.name || "",
                customer_phone: s.customer_phone || user.phone || "",
            }));
        }
    }, [user]);

    const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

    const brands = catalog.filter((b) => b.device_type === f.device_type);
    const currentBrand = brands.find((b) => b.brand === f.brand);
    const models = currentBrand?.models || [];
    const damages = currentBrand?.damages || [];
    const selectedDamage = damages.find((d) => d.key === f.damage);

    const submit = async () => {
        setLoading(true);
        try {
            const { data } = await api.post("/bookings", f);
            toast.success("Booking berhasil dibuat!");
            navigate(`/bookings/${data.id}`);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    const canNext1 = f.service_type && f.device_type;
    const canNext2 = f.brand && f.model && f.damage;
    const canSubmit =
        f.scheduled_date &&
        f.scheduled_time &&
        f.customer_name &&
        f.customer_phone &&
        (f.service_type === "on_store" || f.address);

    return (
        <div className="min-h-screen bg-slate-50 pb-16" data-testid="booking-page">
            <Navbar />
            <div className="mx-auto max-w-3xl px-6 py-12">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                    Booking Perbaikan
                </div>
                <h1 className="mt-2 font-display text-3xl font-black text-[#0a192f]">
                    Amankan slot Anda dalam 3 langkah
                </h1>

                {/* Stepper */}
                <div className="mt-8 grid grid-cols-3 gap-2">
                    {["Layanan", "Perangkat", "Konfirmasi"].map((lbl, i) => (
                        <div key={lbl} className="flex items-center gap-2">
                            <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                    step > i + 1
                                        ? "bg-[#f97316] text-white"
                                        : step === i + 1
                                          ? "bg-[#0a192f] text-white"
                                          : "bg-slate-200 text-slate-500"
                                }`}
                            >
                                {step > i + 1 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                            </div>
                            <span
                                className={`text-sm font-semibold ${
                                    step >= i + 1 ? "text-[#0a192f]" : "text-slate-400"
                                }`}
                            >
                                {lbl}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <Label className="mb-2 block">Pilih Layanan</Label>
                                <div className="grid gap-3 md:grid-cols-3">
                                    {SERVICE_OPTIONS.map((o) => (
                                        <button
                                            key={o.key}
                                            onClick={() => set("service_type", o.key)}
                                            data-testid={`booking-service-${o.key}`}
                                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                                                f.service_type === o.key
                                                    ? "border-[#f97316] bg-orange-50"
                                                    : "border-slate-200 bg-white hover:border-slate-300"
                                            }`}
                                        >
                                            <o.icon className="h-5 w-5 text-[#f97316]" />
                                            <div className="mt-3 font-bold text-[#0a192f]">
                                                {o.label}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">
                                                {o.desc}
                                            </div>
                                            {fees[o.key] > 0 && (
                                                <div className="mt-2 text-xs font-semibold text-[#f97316]">
                                                    +{formatIDR(fees[o.key])} biaya layanan
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label className="mb-2 block">Jenis Perangkat</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["smartphone", "tv"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => {
                                                set("device_type", t);
                                                set("brand", "");
                                                set("model", "");
                                                set("damage", "");
                                            }}
                                            data-testid={`booking-device-${t}`}
                                            className={`rounded-xl border-2 p-4 text-sm font-bold ${
                                                f.device_type === t
                                                    ? "border-[#f97316] bg-orange-50 text-[#0a192f]"
                                                    : "border-slate-200 text-slate-500"
                                            }`}
                                        >
                                            {t === "smartphone" ? "Smartphone / HP" : "TV"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    disabled={!canNext1}
                                    onClick={() => setStep(2)}
                                    className="bg-[#f97316] text-white hover:bg-[#ea580c]"
                                    data-testid="booking-next-1"
                                >
                                    Lanjut
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5">
                            <div>
                                <Label>Brand</Label>
                                <Select value={f.brand} onValueChange={(v) => { set("brand", v); set("model", ""); set("damage", ""); }}>
                                    <SelectTrigger className="mt-1.5" data-testid="booking-brand">
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
                                <Label>Model / Ukuran</Label>
                                <Select value={f.model} onValueChange={(v) => set("model", v)} disabled={!f.brand}>
                                    <SelectTrigger className="mt-1.5" data-testid="booking-model">
                                        <SelectValue placeholder="Pilih model" />
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
                                <Select value={f.damage} onValueChange={(v) => set("damage", v)} disabled={!f.brand}>
                                    <SelectTrigger className="mt-1.5" data-testid="booking-damage">
                                        <SelectValue placeholder="Pilih kerusakan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {damages.map((d) => (
                                            <SelectItem key={d.key} value={d.key}>
                                                {d.label} — dari {formatIDR(d.base_price)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Deskripsi Tambahan (opsional)</Label>
                                <Textarea
                                    value={f.description}
                                    onChange={(e) => set("description", e.target.value)}
                                    rows={3}
                                    placeholder="Ceritakan masalah perangkat Anda..."
                                    data-testid="booking-description"
                                    className="mt-1.5"
                                />
                            </div>

                            {selectedDamage && (
                                <div className="rounded-xl bg-orange-50 p-4 text-sm">
                                    <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                                        Estimasi awal
                                    </div>
                                    <div className="mt-1 font-display text-xl font-black text-[#0a192f]">
                                        {formatIDR(Math.round(selectedDamage.base_price * 0.9) + (fees[f.service_type] || 0))}{" "}–{" "}
                                        {formatIDR(Math.round(selectedDamage.base_price * 1.15) + (fees[f.service_type] || 0))}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        Sudah termasuk biaya layanan {SERVICE_OPTIONS.find(s => s.key === f.service_type)?.label}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(1)} data-testid="booking-back-2">
                                    Kembali
                                </Button>
                                <Button
                                    disabled={!canNext2}
                                    onClick={() => setStep(3)}
                                    className="bg-[#f97316] text-white hover:bg-[#ea580c]"
                                    data-testid="booking-next-2"
                                >
                                    Lanjut
                                </Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <Label>Nama Lengkap</Label>
                                    <Input
                                        value={f.customer_name}
                                        onChange={(e) => set("customer_name", e.target.value)}
                                        className="mt-1.5"
                                        data-testid="booking-name"
                                    />
                                </div>
                                <div>
                                    <Label>No. HP / WhatsApp</Label>
                                    <Input
                                        value={f.customer_phone}
                                        onChange={(e) => set("customer_phone", e.target.value)}
                                        className="mt-1.5"
                                        data-testid="booking-phone"
                                    />
                                </div>
                                <div>
                                    <Label>Tanggal</Label>
                                    <Input
                                        type="date"
                                        value={f.scheduled_date}
                                        onChange={(e) => set("scheduled_date", e.target.value)}
                                        min={new Date().toISOString().slice(0, 10)}
                                        className="mt-1.5"
                                        data-testid="booking-date"
                                    />
                                </div>
                                <div>
                                    <Label>Jam</Label>
                                    <Select value={f.scheduled_time} onValueChange={(v) => set("scheduled_time", v)}>
                                        <SelectTrigger className="mt-1.5" data-testid="booking-time">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                                                <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {f.service_type !== "on_store" && (
                                <div>
                                    <Label>Alamat Lengkap</Label>
                                    <Textarea
                                        rows={3}
                                        value={f.address}
                                        onChange={(e) => set("address", e.target.value)}
                                        placeholder="Jalan, RT/RW, kelurahan, kecamatan"
                                        data-testid="booking-address"
                                        className="mt-1.5"
                                    />
                                    {f.service_type === "home_service" && (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Area jangkauan Home Service: Bojonegoro & sekitarnya.
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={() => setStep(2)} data-testid="booking-back-3">
                                    Kembali
                                </Button>
                                <Button
                                    disabled={!canSubmit || loading}
                                    onClick={submit}
                                    className="bg-[#f97316] text-white hover:bg-[#ea580c]"
                                    data-testid="booking-submit"
                                >
                                    {loading ? "Memproses..." : "Konfirmasi Booking"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
