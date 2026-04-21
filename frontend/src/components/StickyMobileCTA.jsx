import { useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";

export default function StickyMobileCTA() {
    const navigate = useNavigate();
    return (
        <div
            data-testid="sticky-mobile-cta"
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-md md:hidden"
        >
            <button
                onClick={() => navigate("/booking")}
                data-testid="sticky-book-btn"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] py-3.5 font-semibold text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-[0.98]"
            >
                <Calendar className="h-4 w-4" />
                Amankan Slot Booking Anda
            </button>
        </div>
    );
}
