"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VerificationStatusFilter({
    pendingCount = 0,
    verifiedCount = 0,
    rejectedCount = 0,
    completeCount = 0,
    incompleteCount = 0,
    initialStatus = "",
    initialCompleteness = "",
}: {
    pendingCount: number;
    verifiedCount: number;
    rejectedCount: number;
    completeCount: number;
    incompleteCount: number;
    initialStatus?: string;
    initialCompleteness?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (key: string, val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!val) {
            params.delete(key);
        } else {
            params.set(key, val);
        }
        params.delete("page"); // Reset page on filter change
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Status Verifikasi
                </span>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => handleFilterChange("status", "")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${!initialStatus
                            ? "bg-white dark:bg-slate-700 text-primary font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary"
                            }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => handleFilterChange("status", "PENDING")}
                        className={`px-4 py-1.5 shadow-sm rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${initialStatus === "PENDING"
                            ? "bg-white dark:bg-slate-700 text-yellow-700 dark:text-yellow-400"
                            : "text-slate-500 dark:text-slate-400 hover:text-yellow-600"
                            }`}
                    >
                        Pending{" "}
                        <span className={`${initialStatus === "PENDING"
                            ? "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            } px-1.5 py-0.5 rounded text-[10px]`}>
                            {pendingCount}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange("status", "VERIFIED")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${initialStatus === "VERIFIED"
                            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-emerald-600"
                            }`}
                    >
                        Terverifikasi{" "}
                        <span className={`${initialStatus === "VERIFIED"
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            } px-1.5 py-0.5 rounded text-[10px]`}>
                            {verifiedCount}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange("status", "REJECTED")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${initialStatus === "REJECTED"
                            ? "bg-white dark:bg-slate-700 text-red-700 dark:text-red-400 font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-red-600"
                            }`}
                    >
                        Ditolak{" "}
                        <span className={`${initialStatus === "REJECTED"
                            ? "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            } px-1.5 py-0.5 rounded text-[10px]`}>
                            {rejectedCount}
                        </span>
                    </button>
                </div>
            </div>

            {/* Completeness Filter */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Kelengkapan Data
                    </span>
                    {(initialStatus || initialCompleteness) && (
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.delete("status");
                                params.delete("completeness");
                                params.delete("page");
                                router.push(`?${params.toString()}`);
                            }}
                            className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"
                        >
                            Reset Filter
                        </button>
                    )}
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => handleFilterChange("completeness", "")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${!initialCompleteness
                            ? "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            }`}
                    >
                        Semua
                    </button>
                    <button
                        onClick={() => handleFilterChange("completeness", "complete")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${initialCompleteness === "complete"
                            ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-emerald-600"
                            }`}
                    >
                        Lengkap{" "}
                        <span className={`${initialCompleteness === "complete"
                            ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            } px-1.5 py-0.5 rounded text-[10px]`}>
                            {completeCount}
                        </span>
                    </button>
                    <button
                        onClick={() => handleFilterChange("completeness", "incomplete")}
                        className={`px-4 py-1.5 transition-all rounded-lg text-xs font-medium flex items-center gap-2 ${initialCompleteness === "incomplete"
                            ? "bg-white dark:bg-slate-700 text-rose-700 dark:text-rose-400 font-bold shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:text-rose-600"
                            }`}
                    >
                        Belum Lengkap{" "}
                        <span className={`${initialCompleteness === "incomplete"
                            ? "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                            } px-1.5 py-0.5 rounded text-[10px]`}>
                            {incompleteCount}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
