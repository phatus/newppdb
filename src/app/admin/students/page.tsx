import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import StudentFilter from "@/components/admin/students/StudentFilter";
import ExportButton from "@/components/admin/students/ExportButton";
import StudentTable from "@/components/admin/students/StudentTable";
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
                        Data Calon Murid
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola data seluruh pendaftar PMBM.
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

            {/* Table Section */}
            <StudentTable students={students} />
        </div>
    );
}
