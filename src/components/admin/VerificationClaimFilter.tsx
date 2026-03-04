"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VerificationClaimFilter({ initialClaim }: { initialClaim?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("claim");
        } else {
            params.set("claim", val);
        }
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    const options = [
        { id: "all", name: "Semua" },
        { id: "mine", name: "Milik Saya" },
        { id: "unclaimed", name: "Belum Diambil" },
    ];

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Filter Tim
            </span>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleChange(opt.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] ${(initialClaim || "all") === opt.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {opt.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
