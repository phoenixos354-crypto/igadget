import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StatusTimeline from "@/components/StatusTimeline";
import { api, formatIDR, formatApiErrorDetail, API } from "@/lib/api";
import { toast } from "sonner";
import { Pencil, FileText, Trash2, Plus, Users, CheckCircle2, ListChecks, Activity, Camera, Upload } from "lucide-react";

const STATUS_OPTIONS = [
    { v: "received", l: "Diterima" },
    { v: "diagnosed", l: "Diagnosa" },
    { v: "repairing", l: "Dikerjakan" },
    { v: "testing", l: "Testing" },
    { v: "ready", l: "Siap Diambil" },
    { v: "completed", l: "Selesai" },
    { v: "cancelled", l: "Dibatalkan" },
];

export default function Admin() {
    const [bookings, setBookings] = useState([]);
    const [stats, setStats] = useState({});
    const [selected, setSelected] = useState(null);
    const [diagOpen, setDiagOpen] = useState(false);

    const load = async () => {
        const [bs, st] = await Promise.all([
            api.get("/admin/bookings"),
            api.get("/admin/stats"),
        ]);
        setBookings(bs.data);
        setStats(st.data);
    };

    useEffect(() => {
        load();
    }, []);

    const updateStatus = async (id, status, note = "") => {
        try {
            await api.patch(`/admin/bookings/${id}/status`, { status, note });
            toast.success("Status diperbarui");
            load();
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" data-testid="admin-page">
            <Navbar />
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#f97316]">
                    Admin Control Room
                </div>
                <h1 className="mt-2 font-display text-3xl font-black text-[#0a192f]">
                    Kelola semua booking perbaikan
                </h1>

                <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[
                        { l: "Total Booking", v: stats.total_bookings ?? 0, i: ListChecks },
                        { l: "Aktif", v: stats.active ?? 0, i: Activity },
                        { l: "Selesai", v: stats.completed ?? 0, i: CheckCircle2 },
                        { l: "Pelanggan", v: stats.customers ?? 0, i: Users },
                    ].map((s) => (
                        <div key={s.l} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm" data-testid={`stat-${s.l}`}>
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-semibold text-slate-500">{s.l}</div>
                                <s.i className="h-4 w-4 text-[#f97316]" />
                            </div>
                            <div className="mt-2 font-display text-3xl font-black text-[#0a192f]">{s.v}</div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-5">
                        <h2 className="font-display text-lg font-bold text-[#0a192f]">Semua Booking</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">Tracking</th>
                                    <th className="px-4 py-3">Pelanggan</th>
                                    <th className="px-4 py-3">Perangkat</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Estimasi</th>
                                    <th className="px-4 py-3">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {bookings.map((b) => (
                                    <tr key={b.id} data-testid={`admin-row-${b.id}`}>
                                        <td className="px-4 py-3 font-mono-brand text-xs font-bold text-[#f97316]">
                                            {b.tracking_code}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-[#0a192f]">{b.customer_name}</div>
                                            <div className="text-xs text-slate-500">{b.customer_phone}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{b.brand} {b.model}</div>
                                            <div className="text-xs text-slate-500">{b.damage_label}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Select
                                                value={b.current_status}
                                                onValueChange={(v) => updateStatus(b.id, v)}
                                            >
                                                <SelectTrigger className="h-8 w-36" data-testid={`status-select-${b.id}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((o) => (
                                                        <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            {formatIDR(b.estimate_min)} – {formatIDR(b.estimate_max)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => { setSelected(b); setDiagOpen(true); }}
                                                data-testid={`diag-btn-${b.id}`}
                                            >
                                                <FileText className="mr-1 h-3.5 w-3.5" /> Diagnostic
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                                            Belum ada booking.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {selected && (
                    <div className="mt-10 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#f97316]">
                                    Timeline Booking Terpilih
                                </div>
                                <div className="font-display text-lg font-bold text-[#0a192f]">
                                    {selected.tracking_code} • {selected.brand} {selected.model}
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <StatusTimeline currentStatus={selected.current_status} timeline={selected.timeline} />
                        </div>
                    </div>
                )}
            </div>

            <DiagnosticDialog
                booking={selected}
                open={diagOpen}
                onOpenChange={setDiagOpen}
                onSaved={load}
            />
        </div>
    );
}

function DiagnosticDialog({ booking, open, onOpenChange, onSaved }) {
    const [form, setForm] = useState({
        problem_summary: "",
        findings: "",
        items: [{ label: "", price: 0 }],
        labor_cost: 0,
        notes: "",
    });
    const [saving, setSaving] = useState(false);
    const [photosBefore, setPhotosBefore] = useState([]);
    const [photosAfter, setPhotosAfter] = useState([]);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (booking?.diagnostic) {
            setForm({
                problem_summary: booking.diagnostic.problem_summary,
                findings: booking.diagnostic.findings,
                items: booking.diagnostic.items.length ? booking.diagnostic.items : [{ label: "", price: 0 }],
                labor_cost: booking.diagnostic.labor_cost || 0,
                notes: booking.diagnostic.notes || "",
            });
            setPhotosBefore(booking.diagnostic.photos_before || []);
            setPhotosAfter(booking.diagnostic.photos_after || []);
        } else if (booking) {
            setForm({
                problem_summary: booking.damage_label,
                findings: "",
                items: [{ label: booking.damage_label, price: booking.base_estimate || 0 }],
                labor_cost: 0,
                notes: "",
            });
            setPhotosBefore([]);
            setPhotosAfter([]);
        }
    }, [booking]);

    if (!booking) return null;

    const handleUpload = async (kind, files) => {
        if (!files || !files.length) return;
        setUploading(true);
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append("file", file);
                const { data } = await api.post(
                    `/admin/bookings/${booking.id}/diagnostic/photos?kind=${kind}`,
                    fd,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                if (kind === "before") setPhotosBefore((s) => [...s, data]);
                else setPhotosAfter((s) => [...s, data]);
            }
            toast.success(`Foto ${kind} diunggah`);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setUploading(false);
        }
    };

    const setItem = (i, k, v) => {
        const items = form.items.slice();
        items[i] = { ...items[i], [k]: k === "price" ? Number(v) || 0 : v };
        setForm({ ...form, items });
    };

    const save = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/bookings/${booking.id}/diagnostic`, form);
            toast.success("Diagnostic report tersimpan");
            onSaved?.();
            onOpenChange(false);
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setSaving(false);
        }
    };

    const total = form.items.reduce((s, i) => s + (Number(i.price) || 0), 0) + (Number(form.labor_cost) || 0);
    const token = localStorage.getItem("igs_token");
    const fileUrl = (p) => `${API}/files/${p}?auth=${encodeURIComponent(token || "")}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Digital Diagnostic Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                    <div>
                        <Label>Ringkasan Masalah</Label>
                        <Input
                            value={form.problem_summary}
                            onChange={(e) => setForm({ ...form, problem_summary: e.target.value })}
                            className="mt-1.5"
                            data-testid="diag-problem"
                        />
                    </div>
                    <div>
                        <Label>Temuan Teknisi</Label>
                        <Textarea
                            rows={3}
                            value={form.findings}
                            onChange={(e) => setForm({ ...form, findings: e.target.value })}
                            className="mt-1.5"
                            data-testid="diag-findings"
                        />
                    </div>

                    {/* Photo uploads */}
                    <div className="grid gap-3 md:grid-cols-2">
                        {[
                            { kind: "before", label: "Foto Sebelum", photos: photosBefore },
                            { kind: "after", label: "Foto Sesudah", photos: photosAfter },
                        ].map((g) => (
                            <div key={g.kind} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#f97316]">
                                        <Camera className="h-3.5 w-3.5" /> {g.label}
                                    </div>
                                    <label className="cursor-pointer text-xs font-semibold text-[#0a192f] hover:underline">
                                        <Upload className="mr-1 inline h-3 w-3" /> Unggah
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={(e) => handleUpload(g.kind, Array.from(e.target.files))}
                                            data-testid={`diag-upload-${g.kind}`}
                                        />
                                    </label>
                                </div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    {g.photos.map((p) => (
                                        <img
                                            key={p.id || p.path}
                                            src={fileUrl(p.path)}
                                            alt=""
                                            className="h-16 w-full rounded-md border border-slate-200 object-cover"
                                        />
                                    ))}
                                    {g.photos.length === 0 && (
                                        <div className="col-span-3 text-center text-xs text-slate-400">
                                            Belum ada foto
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <Label>Rincian Biaya</Label>
                        <div className="mt-2 space-y-2">
                            {form.items.map((it, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        placeholder="Deskripsi (sparepart/jasa)"
                                        value={it.label}
                                        onChange={(e) => setItem(i, "label", e.target.value)}
                                        data-testid={`diag-item-label-${i}`}
                                    />
                                    <Input
                                        type="number"
                                        placeholder="Harga"
                                        value={it.price}
                                        onChange={(e) => setItem(i, "price", e.target.value)}
                                        className="w-32"
                                        data-testid={`diag-item-price-${i}`}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            const items = form.items.filter((_, x) => x !== i);
                                            setForm({ ...form, items: items.length ? items : [{ label: "", price: 0 }] });
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setForm({ ...form, items: [...form.items, { label: "", price: 0 }] })}
                            >
                                <Plus className="mr-1 h-3 w-3" /> Tambah baris
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Label>Jasa / Labor (Rp)</Label>
                        <Input
                            type="number"
                            value={form.labor_cost}
                            onChange={(e) => setForm({ ...form, labor_cost: Number(e.target.value) || 0 })}
                            className="mt-1.5"
                            data-testid="diag-labor"
                        />
                    </div>
                    <div>
                        <Label>Catatan</Label>
                        <Textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            className="mt-1.5"
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-[#0a192f] p-4 text-white">
                        <span className="text-xs uppercase tracking-widest text-slate-300">Total</span>
                        <span className="font-display text-xl font-black text-[#f97316]">
                            {formatIDR(total)}
                        </span>
                    </div>

                    <Button
                        onClick={save}
                        disabled={saving || uploading}
                        className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                        data-testid="diag-save"
                    >
                        {saving ? "Menyimpan..." : "Simpan Diagnostic Report"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
