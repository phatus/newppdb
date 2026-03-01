import { useState, useEffect } from "react";
import StudentRowCard from "@/components/dashboard/StudentRowCard";
import Link from "next/link";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function StudentListManager({ allActiveWaves = [], showGraduationStatus = false }: { allActiveWaves?: any[], showGraduationStatus?: boolean }) {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [page, setPage] = useState(1);
    const limit = 5; // Show 5 per page

    // Debounce search query to avoid spamming the server
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch data via SWR
    const { data, error, isLoading } = useSWR(
        `/api/students?page=${page}&limit=${limit}&query=${encodeURIComponent(debouncedQuery)}`,
        fetcher
    );

    const students = data?.students || [];
    const pagination = data?.pagination || { totalPages: 1, page: 1, total: 0 };
    const hasDataAtAll = !debouncedQuery && students.length === 0 && page === 1 && !isLoading;

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Daftar Calon Murid
                </h2>

                {/* Search Bar */}
                {(!hasDataAtAll) && (
                    <div className="relative w-full sm:w-64 shrink-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
                        <input
                            type="text"
                            placeholder="Cari nama atau NISN..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary focus:ring-0 outline-none transition-all"
                        />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                </div>
            ) : error ? (
                <div className="p-10 text-center text-red-500 font-bold bg-red-50 dark:bg-red-900/20 rounded-2xl">
                    Gagal memuat data murid.
                </div>
            ) : students.length === 0 && debouncedQuery ? (
                <div className="p-10 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">search_off</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak ada data ditemukan</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Coba kata kunci pencarian lain.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {students.map((student: any) => (
                        <StudentRowCard
                            key={student.id}
                            student={student}
                            allActiveWaves={allActiveWaves}
                            showGraduationStatus={showGraduationStatus}
                        />
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between bg-white dark:bg-[#1e293b] p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-2 flex items-center gap-1 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        Prev
                    </button>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Halaman {pagination.page} dari {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="p-2 flex items-center gap-1 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                </div>
            )}

            {/* Fallback for empty initial state handled in parent or here if students array empty */}
            {hasDataAtAll && (
                <div className="p-10 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">person_off</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum ada data murid</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Silakan tambahkan data calon murid baru terlebih dahulu.</p>
                    <Link href="/dashboard/student/add">
                        <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors">
                            Tambah Murid
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
