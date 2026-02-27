"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function WaveSelector({ waves, initialWaveId }: { waves: any[], initialWaveId?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleWaveChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("waveId");
        } else {
            params.set("waveId", val);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Filter Gelombang
            </span>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleWaveChange("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] ${!initialWaveId || initialWaveId === "all"
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        }`}
                >
                    Semua
                </button>
                {waves.map((w) => (
                    <button
                        key={w.id}
                        onClick={() => handleWaveChange(w.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] ${initialWaveId === w.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {w.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
