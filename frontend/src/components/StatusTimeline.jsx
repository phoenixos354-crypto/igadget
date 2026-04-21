import { Check, Package, Search, Hammer, FlaskConical, CheckCircle2 } from "lucide-react";

const STAGES = [
    { key: "received", label: "Diterima", icon: Package },
    { key: "diagnosed", label: "Diagnosa", icon: Search },
    { key: "repairing", label: "Dikerjakan", icon: Hammer },
    { key: "testing", label: "Testing", icon: FlaskConical },
    { key: "ready", label: "Siap Diambil", icon: CheckCircle2 },
];

export default function StatusTimeline({ currentStatus, timeline = [] }) {
    const currentIndex = STAGES.findIndex((s) => s.key === currentStatus);
    const effectiveIndex = currentStatus === "completed" ? STAGES.length - 1 : currentIndex;

    return (
        <div data-testid="status-timeline" className="w-full">
            {/* Horizontal stages */}
            <div className="relative">
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200" />
                <div
                    className="absolute left-0 top-5 h-0.5 bg-[#f97316] transition-all duration-500"
                    style={{
                        width:
                            effectiveIndex <= 0
                                ? "0%"
                                : `${(effectiveIndex / (STAGES.length - 1)) * 100}%`,
                    }}
                />
                <div className="relative grid grid-cols-5 gap-2">
                    {STAGES.map((s, i) => {
                        const Icon = s.icon;
                        const done = i < effectiveIndex;
                        const active = i === effectiveIndex;
                        return (
                            <div
                                key={s.key}
                                className="flex flex-col items-center"
                                data-testid={`timeline-stage-${s.key}`}
                            >
                                <div
                                    className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                        active
                                            ? "pulse-dot border-[#f97316] bg-[#f97316] text-white"
                                            : done
                                              ? "border-[#f97316] bg-[#f97316] text-white"
                                              : "border-slate-200 bg-white text-slate-400"
                                    }`}
                                >
                                    {done ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Icon className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`mt-2 text-center text-[11px] font-semibold sm:text-xs ${
                                        active || done ? "text-[#0a192f]" : "text-slate-400"
                                    }`}
                                >
                                    {s.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Detailed history */}
            {timeline.length > 0 && (
                <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f97316]">
                        Riwayat
                    </h4>
                    <ul className="space-y-3">
                        {[...timeline].reverse().map((t, idx) => (
                            <li key={idx} className="flex gap-3 text-sm">
                                <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#f97316]" />
                                <div>
                                    <div className="font-semibold text-[#0a192f] capitalize">
                                        {t.status.replace("_", " ")}
                                    </div>
                                    {t.note && <div className="text-slate-600">{t.note}</div>}
                                    <div className="text-xs text-slate-400">
                                        {new Date(t.at).toLocaleString("id-ID")}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
