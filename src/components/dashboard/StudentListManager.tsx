"use client";

import { useState } from "react";
import StudentRowCard from "@/components/dashboard/StudentRowCard";
import Link from "next/link";

export default function StudentListManager({ students, showGraduationStatus = false }: { students: any[], showGraduationStatus?: boolean }) {
    const [query, setQuery] = useState("");

    const filteredStudents = students.filter((s) =>
        s.namaLengkap.toLowerCase().includes(query.toLowerCase()) ||
        (s.nisn && s.nisn.includes(query))
    );

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                    Daftar Calon Peserta Didik
                </h2>

                {/* Search Bar */}
                {students.length > 0 && (
                    <div className="relative w-full sm:w-64">
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

            {filteredStudents.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">search_off</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Tidak ada data ditemukan</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Coba kata kunci pencarian lain.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredStudents.map((student) => (
                        <StudentRowCard key={student.id} student={student} showGraduationStatus={showGraduationStatus} />
                    ))}
                </div>
            )}

            {/* Fallback for empty initial state handled in parent or here if students array empty */}
            {students.length === 0 && (
                <div className="p-10 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <span className="material-symbols-outlined text-3xl">person_off</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum ada data siswa</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Silakan tambahkan data calon siswa baru terlebih dahulu.</p>
                    <Link href="/dashboard/student/add">
                        <button className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors">
                            Tambah Siswa
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
