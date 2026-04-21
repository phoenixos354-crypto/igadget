import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Wrench } from "lucide-react";

export default function Footer() {
    return (
        <footer
            data-testid="site-footer"
            className="mt-24 border-t border-slate-100 bg-[#0a192f] text-slate-300"
        >
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                            <Wrench className="h-5 w-5 text-[#f97316]" />
                        </div>
                        <div className="font-display text-xl font-extrabold text-white">
                            iGadget<span className="text-[#f97316]">.</span>Service
                        </div>
                    </div>
                    <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-400">
                        Profesionalisme di setiap sentuhan. Perbaiki HP/TV Anda dengan
                        transparansi 100% — lihat langsung teknisi kami bekerja.
                    </p>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f97316]">
                        Layanan
                    </h4>
                    <ul className="mt-4 space-y-2 text-sm">
                        <li>
                            <Link to="/booking" className="hover:text-white">
                                Service On Store
                            </Link>
                        </li>
                        <li>
                            <Link to="/booking" className="hover:text-white">
                                Pickup &amp; Delivery
                            </Link>
                        </li>
                        <li>
                            <Link to="/booking" className="hover:text-white">
                                Home Service
                            </Link>
                        </li>
                        <li>
                            <Link to="/calculator" className="hover:text-white">
                                Cost Calculator
                            </Link>
                        </li>
                    </ul>
                </div>

                <div>
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-[#f97316]">
                        Kontak
                    </h4>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-[#f97316]" /> Jl. Raya
                            Bojonegoro, Jawa Timur
                        </li>
                        <li className="flex items-start gap-2">
                            <Phone className="mt-0.5 h-4 w-4 text-[#f97316]" /> +62 812 3456 7890
                        </li>
                        <li className="flex items-start gap-2">
                            <Mail className="mt-0.5 h-4 w-4 text-[#f97316]" /> halo@igadget.id
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
                © {new Date().getFullYear()} iGadget Service Bojonegoro. Professional Repair,
                Transparent Process, Zero Hassle.
            </div>
        </footer>
    );
}
