import { db } from "@/lib/db";
import Link from "next/link";
import BatchGradeTable from "@/components/admin/BatchGradeTable";
import WaveSelector from "@/components/admin/WaveSelector";
import JalurSelector from "@/components/admin/JalurSelector";
import PaginationControl from "@/components/admin/PaginationControl";
import { Suspense } from "react";

const PAGE_SIZE = 20;

export default async function GradesPage({
    searchParams,
}: {
    searchParams: Promise<{ waveId?: string; page?: string; jalur?: string }>;
}) {
    const resolvedParams = await searchParams;
    const waveId = resolvedParams?.waveId;
    const jalur = resolvedParams?.jalur;
    const currentPage = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    const whereClause: any = {
        statusVerifikasi: "VERIFIED" // Only allow grading verified students
    };

    if (waveId && waveId !== "all") {
        whereClause.waveId = waveId;
    }

    if (jalur && jalur !== "all") {
        whereClause.jalur = jalur as any;
    }

    const [students, totalFiltered, waves] = await Promise.all([
        db.student.findMany({
            where: whereClause,
            include: {
                grades: {
                    include: {
                        semesterGrades: true
                    }
                },
                user: true,
                documents: true,
            },
            orderBy: { namaLengkap: 'asc' },
            skip,
            take: PAGE_SIZE,
        }),
        db.student.count({ where: whereClause }),
        db.wave.findMany({ orderBy: { startDate: 'desc' } }),
    ]);

    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Olah Nilai Murid</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
                        Input nilai ujian teori, SKUA, dan nilai raport murid yang telah terverifikasi.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <WaveSelector waves={waves} initialWaveId={waveId} />
                    <JalurSelector initialJalur={jalur} />
                    <Link href="/admin/grades/import" className="ml-auto w-full sm:w-auto">
                        <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow">
                            <span className="material-symbols-outlined">upload_file</span>
                            Import Nilai CBT
                        </button>
                    </Link>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {students.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inbox</span>
                        <p className="text-slate-500">Belum ada murid yang terverifikasi untuk dinilai.</p>
                    </div>
                ) : (
                    <>
                        <BatchGradeTable students={students as any} />
                        {totalPages > 1 && (
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                <Suspense fallback={null}>
                                    <PaginationControl
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        totalItems={totalFiltered}
                                        itemsPerPage={PAGE_SIZE}
                                    />
                                </Suspense>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
