"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function VerificationStatusFilter({
    pendingCount = 0,
    verifiedCount = 0,
    rejectedCount = 0,
    initialStatus = "",
}: {
    pendingCount: number;
    verifiedCount: number;
    rejectedCount: number;
    initialStatus?: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleStatusChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (!val) {
            params.delete("status");
        } else {
            params.set("status", val);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Status Verifikasi
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => handleStatusChange("PENDING")}
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
                    onClick={() => handleStatusChange("VERIFIED")}
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
                    onClick={() => handleStatusChange("REJECTED")}
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

                {/* Clear filter button */}
                {initialStatus && (
                    <button
                        onClick={() => handleStatusChange("")}
                        className="px-2 py-1 flex items-center justify-center text-slate-400 hover:text-red-500 rounded-lg ml-1"
                        title="Hapus filter status"
                    >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                )}
            </div>
        </div>
    );
}
