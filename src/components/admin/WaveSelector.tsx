"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function WaveSelector({ waves, initialWaveId }: { waves: any[], initialWaveId?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleWaveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("waveId");
        } else {
            params.set("waveId", val);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gelombang:</span>
            <select
                value={initialWaveId || "all"}
                onChange={handleWaveChange}
                className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-primary/20"
            >
                <option value="all">Semua Gelombang</option>
                {waves.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                ))}
            </select>
        </div>
    );
}
