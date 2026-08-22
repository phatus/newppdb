"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getAcademicYears } from "@/app/actions/academic-year";

interface AcademicYearFilterProps {
    className?: string;
    showAllOption?: boolean;
}

export default function AcademicYearFilter({ className = "", showAllOption = true }: AcademicYearFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [years, setYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(searchParams.get("academicYear") || "");
    const [currentSystemYear, setCurrentSystemYear] = useState<string>("2025/2026");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchYears() {
            try {
                const res = await getAcademicYears();
                if (res.success) {
                    setYears(res.years || []);
                    setCurrentSystemYear(res.currentYear || "2025/2026");
                    if (!searchParams.get("academicYear")) {
                        setSelectedYear(res.currentYear || "2025/2026");
                    }
                }
            } catch (err) {
                console.error("Error loading academic years filter:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchYears();
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedYear(val);

        const params = new URLSearchParams(searchParams.toString());
        if (val && val !== "all") {
            params.set("academicYear", val);
        } else if (val === "all") {
            params.set("academicYear", "all");
        } else {
            params.delete("academicYear");
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className={`flex items-center gap-2 text-xs text-slate-400 ${className}`}>
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                Memuat T.P...
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-base text-primary">calendar_month</span>
                <span>T.P:</span>
            </label>
            <select
                value={selectedYear || currentSystemYear}
                onChange={handleChange}
                className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
                {years.map(y => (
                    <option key={y} value={y}>
                        {y} {y === currentSystemYear ? "(Aktif)" : ""}
                    </option>
                ))}
                {showAllOption && (
                    <option value="all">Semua Tahun Pelajaran</option>
                )}
            </select>
        </div>
    );
}
