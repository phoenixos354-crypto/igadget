import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("Jika email terdaftar, link reset telah dikirim.");
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" data-testid="forgot-password-page">
            <Navbar />
            <div className="mx-auto max-w-md px-6 py-16">
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a192f]">
                        <KeyRound className="h-6 w-6 text-[#f97316]" />
                    </div>
                </div>
                <h1 className="mt-6 text-center font-display text-3xl font-black text-[#0a192f]">
                    Lupa password?
                </h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Masukkan email Anda, kami akan kirim link reset password.
                </p>

                {sent ? (
                    <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                        <div className="font-semibold text-green-800">Email terkirim</div>
                        <p className="mt-2 text-sm text-green-700">
                            Jika email terdaftar, Anda akan menerima link reset. Periksa inbox dan spam.
                        </p>
                        <p className="mt-3 text-xs text-slate-500">
                            (Untuk demo: link muncul di log backend.)
                        </p>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1.5"
                                    data-testid="forgot-email"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                                data-testid="forgot-submit"
                            >
                                {loading ? "Memuat..." : "Kirim Link Reset"}
                            </Button>
                        </div>
                    </form>
                )}

                <p className="mt-6 text-center text-sm text-slate-500">
                    <Link to="/login" className="font-semibold text-[#f97316] hover:underline">
                        Kembali ke Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
