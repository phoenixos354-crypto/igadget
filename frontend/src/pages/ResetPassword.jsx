import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, formatApiErrorDetail } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound } from "lucide-react";

export default function ResetPassword() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const token = params.get("token") || "";
    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }
        if (newPassword !== confirm) {
            toast.error("Konfirmasi password tidak cocok");
            return;
        }
        setLoading(true);
        try {
            await api.post("/auth/reset-password", { token, new_password: newPassword });
            toast.success("Password berhasil direset. Silakan login.");
            navigate("/login", { replace: true });
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" data-testid="reset-password-page">
            <Navbar />
            <div className="mx-auto max-w-md px-6 py-16">
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a192f]">
                        <KeyRound className="h-6 w-6 text-[#f97316]" />
                    </div>
                </div>
                <h1 className="mt-6 text-center font-display text-3xl font-black text-[#0a192f]">
                    Reset Password
                </h1>

                {!token ? (
                    <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-800">
                        Token tidak valid. Mohon minta link reset ulang.
                        <div className="mt-3">
                            <Link to="/forgot-password" className="font-semibold text-[#f97316] hover:underline">
                                Kirim ulang link
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="pw">Password Baru</Label>
                                <Input
                                    id="pw"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1.5"
                                    data-testid="reset-new-password"
                                />
                            </div>
                            <div>
                                <Label htmlFor="cpw">Konfirmasi Password</Label>
                                <Input
                                    id="cpw"
                                    type="password"
                                    required
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    className="mt-1.5"
                                    data-testid="reset-confirm"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                                data-testid="reset-submit"
                            >
                                {loading ? "Memuat..." : "Simpan Password Baru"}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
