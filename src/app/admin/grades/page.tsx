import { db } from "@/lib/db";
import Link from "next/link";
import BatchGradeTable from "@/components/admin/BatchGradeTable";

export default async function GradesPage() {
    const students = await db.student.findMany({
        where: {
            statusVerifikasi: "VERIFIED" // Only allow grading verified students
        },
        include: {
            grades: {
                include: {
                    semesterGrades: true
                }
            },
            user: true,
            documents: true,
        },
        orderBy: {
            namaLengkap: 'asc'
        }
    });

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Olah Nilai Siswa</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Input nilai ujian teori, SKUA, dan nilai raport siswa yang telah terverifikasi.
                    </p>
                </div>
                <Link href="/admin/grades/import">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow">
                        <span className="material-symbols-outlined">upload_file</span>
                        Import Nilai CBT
                    </button>
                </Link>
            </div>

            <div className="flex flex-col gap-6">
                {students.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">inbox</span>
                        <p className="text-slate-500">Belum ada siswa yang terverifikasi untuk dinilai.</p>
                    </div>
                ) : (
                    <BatchGradeTable students={students as any} />
                )}
            </div>
        </div>
    );
}
