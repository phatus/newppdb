"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function JalurSelector({ initialJalur }: { initialJalur?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleJalurChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("jalur");
        } else {
            params.set("jalur", val);
        }
        // Reset page to 1 when filter changes
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    const jalurs = [
        { id: "REGULER", name: "Reguler" },
        { id: "PRESTASI_AKADEMIK", name: "Prestasi Akademik" },
        { id: "PRESTASI_NON_AKADEMIK", name: "Prestasi Non-Akademik" },
        { id: "AFIRMASI", name: "Afirmasi" },
    ];

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Filter Jalur
            </span>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => handleJalurChange("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] ${!initialJalur || initialJalur === "all"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        }`}
                >
                    Semua
                </button>
                {jalurs.map((j) => (
                    <button
                        key={j.id}
                        onClick={() => handleJalurChange(j.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] ${initialJalur === j.id
                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {j.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
