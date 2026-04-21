import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Wrench, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isUser = user && typeof user === "object";

    const linkClass = ({ isActive }) =>
        `text-sm font-semibold transition-colors ${
            isActive ? "text-[#0a192f]" : "text-slate-500 hover:text-[#0a192f]"
        }`;

    return (
        <header
            data-testid="top-navbar"
            className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-xl"
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
                <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a192f]">
                        <Wrench className="h-5 w-5 text-[#f97316]" />
                    </div>
                    <div className="leading-none">
                        <div className="font-display text-lg font-extrabold text-[#0a192f]">
                            iGadget<span className="text-[#f97316]">.</span>
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                            Service Bojonegoro
                        </div>
                    </div>
                </Link>

                <nav className="hidden items-center gap-7 md:flex">
                    <NavLink to="/" end className={linkClass} data-testid="nav-home">
                        Beranda
                    </NavLink>
                    <NavLink to="/calculator" className={linkClass} data-testid="nav-calculator">
                        Cost Calculator
                    </NavLink>
                    <NavLink to="/booking" className={linkClass} data-testid="nav-booking">
                        Booking
                    </NavLink>
                    <NavLink to="/track" className={linkClass} data-testid="nav-track">
                        Lacak Perbaikan
                    </NavLink>
                    <NavLink to="/blog" className={linkClass} data-testid="nav-blog">
                        Edukasi
                    </NavLink>
                </nav>

                <div className="flex items-center gap-2">
                    {isUser ? (
                        <>
                            {user.role === "admin" && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate("/admin")}
                                    data-testid="nav-admin-btn"
                                    className="hidden sm:inline-flex"
                                >
                                    Admin
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/dashboard")}
                                data-testid="nav-dashboard-btn"
                                className="hidden sm:inline-flex"
                            >
                                <UserIcon className="mr-1.5 h-4 w-4" />
                                {user.name?.split(" ")[0] || "Dasbor"}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={logout}
                                data-testid="nav-logout-btn"
                                aria-label="Logout"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/login")}
                                data-testid="nav-login-btn"
                            >
                                Masuk
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => navigate("/booking")}
                                className="bg-[#f97316] text-white shadow-lg shadow-orange-500/20 hover:bg-[#ea580c]"
                                data-testid="nav-book-cta"
                            >
                                Booking Sekarang
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
