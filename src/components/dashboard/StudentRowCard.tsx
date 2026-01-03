"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StudentRowCardProps {
    student: any;
    showGraduationStatus?: boolean;
}

export default function StudentRowCard({ student, showGraduationStatus = false }: StudentRowCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const isVerified = student.statusVerifikasi === "VERIFIED";
    const isRejected = student.statusVerifikasi === "REJECTED";
    const isPending = student.statusVerifikasi === "PENDING";

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
        <div className={`group flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1c2936] border shadow-sm transition-all hover:shadow-md ${isRejected ? 'border-red-200 dark:border-red-900' : isVerified ? 'border-emerald-200 dark:border-emerald-900' : 'border-slate-200 dark:border-slate-700'}`}>

            {/* 1. Photo & Basic Info */}
            <div className="flex items-center gap-4 flex-1">
                <div
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-cover bg-center shrink-0 border border-slate-100 ${isRejected ? 'grayscale' : ''}`}
                    style={{ backgroundImage: `url('${student.documents?.pasFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.namaLengkap)}&background=random`}')` }}
                ></div>

                <div className="flex flex-col gap-0.5 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={student.namaLengkap}>
                        {student.namaLengkap}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>NISN: {student.nisn || "-"}</span>
                        <span>•</span>
                        <span>{student.jalur ? student.jalur.replace(/_/g, " ") : "REGULER"}</span>
                    </div>

                    {isRejected && student.catatanPenolakan && (
                        <div className="flex items-start gap-1 mt-1 text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/10 p-1.5 rounded-lg border border-red-100 dark:border-red-900/30">
                            <span className="material-symbols-outlined text-[14px] shrink-0 mt-0.5">info</span>
                            <span>{student.catatanPenolakan}</span>
                        </div>
                    )}

                    {/* Conditional Graduation Status for Multi-Student Accounts */}
                    {showGraduationStatus && student.statusKelulusan === "LULUS" && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                            <div className="p-1 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[16px]">celebration</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Dinyatakan LULUS</h4>
                                <p className="text-[10px] text-emerald-700 dark:text-emerald-300 leading-tight">Selamat! Silakan cek menu pengumuman.</p>
                            </div>
                        </div>
                    )}

                    {showGraduationStatus && student.statusKelulusan === "TIDAK_LULUS" && (
                        <div className="flex items-start gap-2 mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="p-1 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[16px]">sentiment_dissatisfied</span>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-red-800 dark:text-red-200">TIDAK LULUS</h4>
                                <p className="text-[10px] text-red-700 dark:text-red-300 leading-tight">Mohon maaf, Anda belum lolos seleksi.</p>
                            </div>
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" :
                            isRejected ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/30 dark:text-red-400" :
                                "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                            <span className="material-symbols-outlined text-[12px]">
                                {isVerified ? 'verified' : isRejected ? 'cancel' : 'hourglass_top'}
                            </span>
                            {isVerified ? "Terverifikasi" : isRejected ? "Ditolak / Perbaikan" : "Dalam Proses"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Action Buttons (Right Aligned on Desktop) */}
            <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-3 md:pt-0">

                {/* Edit Button */}
                <Link href={`/dashboard/student/add?studentId=${student.id}`} title="Edit Biodata">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        <span className="hidden lg:inline">Edit</span>
                    </button>
                </Link>

                {/* Docs Button */}
                <Link href={`/dashboard/student/documents?studentId=${student.id}`} title="Upload Dokumen">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors">
                        <span className="material-symbols-outlined text-[16px]">description</span>
                        <span className="hidden lg:inline">Dokumen</span>
                    </button>
                </Link>

                {/* Grades Button */}
                <Link href={`/dashboard/student/grades?studentId=${student.id}`} title="Input Nilai">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors">
                        <span className="material-symbols-outlined text-[16px]">score</span>
                        <span className="hidden lg:inline">Nilai</span>
                    </button>
                </Link>

                {/* Print Proof Button */}
                <Link href={`/dashboard/student/registration-proof?studentId=${student.id}`} title="Cetak Bukti Pendaftaran">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold transition-colors">
                        <span className="material-symbols-outlined text-[16px]">print</span>
                        <span className="hidden lg:inline">Bukti</span>
                    </button>
                </Link>

                {/* Print Exam Card (Only if Verified) */}
                {isVerified && (
                    <Link href="/dashboard/student/exam-card" title="Cetak Kartu Ujian">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 text-xs font-bold transition-colors">
                            <span className="material-symbols-outlined text-[16px]">badge</span>
                            <span className="hidden lg:inline">Kartu Ujian</span>
                        </button>
                    </Link>
                )}

                {/* Delete Button (Only if NOT Verified) */}
                {!isVerified && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center justify-center p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Hapus Siswa"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                )}
            </div>
        </div>
    );
}
