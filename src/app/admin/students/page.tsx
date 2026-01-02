import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import StudentFilter from "@/components/admin/students/StudentFilter";
import ExportButton from "@/components/admin/students/ExportButton";
import { Suspense } from "react";
// import { JalurPendaftaran, VerificationStatus } from "@prisma/client"; // Skipped due to stale client

export default async function StudentListPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string; jalur: string; status: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";
    const jalur = resolvedParams?.jalur;
    const status = resolvedParams?.status;

    // 1. Build Where Clause
    const whereClause: any = {};

    if (query) {
        whereClause.OR = [
            { namaLengkap: { contains: query, mode: "insensitive" } },
            { nisn: { contains: query } },
            { asalSekolah: { contains: query, mode: "insensitive" } },
        ];
    }

    if (jalur) {
        whereClause.jalur = jalur as any;
    }

    if (status) {
        whereClause.statusVerifikasi = status as any;
    }

    const students = await db.student.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
    });

    const totalCount = await db.student.count();
    const verifiedCount = await db.student.count({
        where: { statusVerifikasi: "VERIFIED" },
    });

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Data Calon Siswa
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola data seluruh pendaftar PPDB.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Suspense fallback={null}>
                        <StudentFilter />
                    </Suspense>
                    <ExportButton students={students} />
                </div>
            </div>

            {/* Search & Stats Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <Suspense fallback={<div className="w-full sm:w-72 h-10 bg-slate-100 rounded-lg animate-pulse" />}>
                    <SearchInput />
                </Suspense>
                <div className="flex gap-4 text-sm font-medium text-slate-500">
                    <span>Total: <strong className="text-slate-900 dark:text-white">{totalCount}</strong></span>
                    <span>Verifikasi: <strong className="text-yellow-600">{verifiedCount}</strong></span>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">No</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">NISN</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Asal Sekolah</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Jalur</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        Data pendaftar masih kosong.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student: any, index: number) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{student.namaLengkap}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">{student.nisn}</td>
                                        <td className="px-6 py-4 text-slate-500">{student.asalSekolah || "-"}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${student.jalur === 'PRESTASI_AKADEMIK' ? 'bg-purple-100 text-purple-800' :
                                                    student.jalur === 'PRESTASI_NON_AKADEMIK' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {student.jalur ? student.jalur.replace(/_/g, " ") : "REGULER"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${student.statusVerifikasi === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                                student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.statusVerifikasi === 'VERIFIED' ? 'bg-green-600' :
                                                    student.statusVerifikasi === 'REJECTED' ? 'bg-red-600' :
                                                        'bg-yellow-600'
                                                    }`}></span>
                                                {student.statusVerifikasi === 'VERIFIED' ? 'Verified' :
                                                    student.statusVerifikasi === 'REJECTED' ? 'Rejected' :
                                                        'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/verification/${student.id}`} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Verifikasi / Detail">
                                                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                                                </Link>
                                                {/* 
                                                <button className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Hapus">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                                */}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination (Static for now, simpler than full impl) */}
                <div className="bg-white dark:bg-[#1e293b] px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Menampilkan <span className="font-medium text-slate-900 dark:text-white">{students.length > 0 ? 1 : 0}</span> sampai <span className="font-medium text-slate-900 dark:text-white">{students.length}</span> dari <span className="font-medium text-slate-900 dark:text-white">{totalCount}</span> data
                    </p>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Previous</button>
                        <button disabled className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
