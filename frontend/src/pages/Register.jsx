import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Wrench } from "lucide-react";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
    const [loading, setLoading] = useState(false);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const u = await register(form);
            toast.success(`Akun dibuat. Halo ${u.name}!`);
            navigate("/dashboard", { replace: true });
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" data-testid="register-page">
            <Navbar />
            <div className="mx-auto flex max-w-md flex-col px-6 py-16">
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a192f]">
                        <Wrench className="h-6 w-6 text-[#f97316]" />
                    </div>
                </div>
                <h1 className="mt-6 text-center font-display text-3xl font-black text-[#0a192f]">
                    Buat akun baru
                </h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Hanya butuh 30 detik. Gratis selamanya.
                </p>

                <form
                    onSubmit={submit}
                    className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Lengkap</Label>
                            <Input
                                id="name"
                                required
                                value={form.name}
                                onChange={(e) => set("name", e.target.value)}
                                data-testid="register-name"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => set("email", e.target.value)}
                                data-testid="register-email"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">No. HP (WhatsApp)</Label>
                            <Input
                                id="phone"
                                value={form.phone}
                                onChange={(e) => set("phone", e.target.value)}
                                placeholder="+62 812-xxxx-xxxx"
                                data-testid="register-phone"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password (min. 6 karakter)</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                minLength={6}
                                value={form.password}
                                onChange={(e) => set("password", e.target.value)}
                                data-testid="register-password"
                                className="mt-1.5"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                            data-testid="register-submit"
                        >
                            {loading ? "Memuat..." : "Daftar Sekarang"}
                        </Button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="font-semibold text-[#f97316] hover:underline">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}
