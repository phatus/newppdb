"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CompactStudentCardProps {
    student: any;
}

export default function CompactStudentCard({ student }: CompactStudentCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const isVerified = student.statusVerifikasi === "VERIFIED";
    const isRejected = student.statusVerifikasi === "REJECTED";
    const isPending = student.statusVerifikasi === "PENDING";

    // Progress Calculation
    const docs = student.documents || {};
    const requiredDocs = ['fileKK', 'fileAkta', 'fileRaport', 'pasFoto'];
    const docsComplete = requiredDocs.every(key => docs[key]);
    const gradeCount = student.grades?.semesterGrades?.length || 0;
    const gradesComplete = gradeCount >= 3;

    let progressStep = "Pendaftaran";
    let progressColor = "text-slate-500";

    if (docsComplete) {
        progressStep = "Input Nilai";
        progressColor = "text-amber-600";
    }
    if (docsComplete && gradesComplete) {
        progressStep = "Verifikasi";
        progressColor = "text-blue-600";
    }
    if (isVerified) {
        progressStep = "Selesai";
        progressColor = "text-emerald-600";
    }

    const handleDelete = async () => {
        if (!confirm("Hapus data siswa ini?")) return;

        setIsDeleting(true);
        try {
            await fetch(`/api/students/${student.id}`, { method: "DELETE" });
            router.refresh();
        } catch (error) {
            alert("Gagal menghapus");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={`group flex flex-col md:flex-row items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#1c2936] border shadow-sm transition-all hover:shadow-md ${isRejected ? 'border-red-200 dark:border-red-900' : isVerified ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-700'}`}>

            {/* Minimalist Photo */}
            <div
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-cover bg-center shrink-0 border border-slate-100 ${isRejected ? 'grayscale' : ''}`}
                style={{ backgroundImage: `url('${student.documents?.pasFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.namaLengkap)}&background=random`}')` }}
            ></div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-1 text-center md:text-left">
                <div className="flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={student.namaLengkap}>
                        {student.namaLengkap}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate">NISN: {student.nisn}</p>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2">
                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                            isRejected ? "bg-red-50 text-red-700 border-red-100" :
                                "bg-amber-50 text-amber-700 border-amber-100"
                        }`}>
                        {isVerified ? "Terverifikasi" : isRejected ? "Ditolak" : "Proses"}
                    </span>

                    {/* Progress Text */}
                    <span className={`text-[10px] font-medium ${progressColor}`}>
                        • {progressStep}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0">
                <Link href={`/dashboard/student/add?studentId=${student.id}`} title="Edit Data">
                    <button className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                </Link>
                {isVerified ? (
                    <Link href="/dashboard/student/exam-card" title="Cetak Kartu">
                        <button className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">print</span>
                        </button>
                    </Link>
                ) : (
                    <Link href={`/dashboard/student/documents?studentId=${student.id}`} title="Upload Dokumen">
                        <button className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">upload</span>
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
