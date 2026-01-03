"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function StudentFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Initial state from URL
    const [jalur, setJalur] = useState(searchParams.get("jalur") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "");

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (jalur) params.set("jalur", jalur);
        else params.delete("jalur");

        if (status) params.set("status", status);
        else params.delete("status");

        router.push(`?${params.toString()}`);
        setIsOpen(false);
    };

    const handleReset = () => {
        setJalur("");
        setStatus("");
        const params = new URLSearchParams(searchParams.toString());
        params.delete("jalur");
        params.delete("status");
        router.push(`?${params.toString()}`);
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const activeFiltersCount = (jalur ? 1 : 0) + (status ? 1 : 0);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors
                    ${activeFiltersCount > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                    }`}
            >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filter
                {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900 dark:text-white">Filter Data</h3>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Jalur Pendaftaran</label>
                            <select
                                value={jalur}
                                onChange={(e) => setJalur(e.target.value)}
                                className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Semua Jalur</option>
                                <option value="REGULER">Reguler</option>
                                <option value="PRESTASI_AKADEMIK">Prestasi Akademik</option>
                                <option value="PRESTASI_NON_AKADEMIK">Prestasi Non-Akademik</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500">Status Verifikasi</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Semua Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="VERIFIED">Verified</option>
                                <option value="REJECTED">rejected</option>
                            </select>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button
                                onClick={handleReset}
                                className="flex-1 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleApply}
                                className="flex-1 px-3 py-2 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg transition-colors shadow-sm"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
