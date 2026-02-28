import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import StudentFilter from "@/components/admin/students/StudentFilter";
import ExportButton from "@/components/admin/students/ExportButton";
import StudentTable from "@/components/admin/students/StudentTable";
import WaveSelector from "@/components/admin/WaveSelector";
import ExportCbtButton from "@/components/admin/ExportCbtButton";
import PhotoExportButton from "@/components/admin/PhotoExportButton";
import { Suspense } from "react";

export default async function StudentListPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string; jalur: string; status: string; waveId: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";
    const jalur = resolvedParams?.jalur;
    const status = resolvedParams?.status;
    const waveId = resolvedParams?.waveId;

    // Fetch waves for filter
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'desc' }
    });

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

    if (waveId && waveId !== "all") {
        whereClause.waveId = waveId;
    }

    const students = await db.student.findMany({
        where: whereClause,
        include: {
            user: true,
            documents: true,
            wave: true,
        },
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
                        Data Calon Murid
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola data seluruh pendaftar PMBM.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <ExportCbtButton waveId={waveId} />
                    <PhotoExportButton waveId={waveId} />
                    <Suspense fallback={null}>
                        <StudentFilter />
                    </Suspense>
                    <ExportButton students={students} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <Suspense fallback={null}>
                    <WaveSelector waves={waves} initialWaveId={waveId} />
                </Suspense>
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

            {/* Table Section */}
            <StudentTable students={students} />
        </div>
    );
}
