import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatApiErrorDetail } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Wrench } from "lucide-react";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success(`Selamat datang kembali, ${u.name}!`);
            const to =
                u.role === "admin"
                    ? "/admin"
                    : location.state?.from || "/dashboard";
            navigate(to, { replace: true });
        } catch (e) {
            toast.error(formatApiErrorDetail(e.response?.data?.detail) || e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50" data-testid="login-page">
            <Navbar />
            <div className="mx-auto flex max-w-md flex-col px-6 py-16">
                <div className="flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a192f]">
                        <Wrench className="h-6 w-6 text-[#f97316]" />
                    </div>
                </div>
                <h1 className="mt-6 text-center font-display text-3xl font-black text-[#0a192f]">
                    Masuk ke akun Anda
                </h1>
                <p className="mt-2 text-center text-sm text-slate-500">
                    Lacak perbaikan dan kelola booking Anda.
                </p>

                <form
                    onSubmit={submit}
                    className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                data-testid="login-email"
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••"
                                data-testid="login-password"
                                className="mt-1.5"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#f97316] text-white hover:bg-[#ea580c]"
                            data-testid="login-submit"
                        >
                            {loading ? "Memuat..." : "Masuk"}
                        </Button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-slate-500">
                    Belum punya akun?{" "}
                    <Link to="/register" className="font-semibold text-[#f97316] hover:underline">
                        Daftar disini
                    </Link>
                </p>
            </div>
        </div>
    );
}
