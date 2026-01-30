"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StudentCardProps {
    student: any; // We can improve this type later
}

export default function StudentCard({ student }: StudentCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const isVerified = student.statusVerifikasi === "VERIFIED";
    const isRejected = student.statusVerifikasi === "REJECTED";
    const isPending = student.statusVerifikasi === "PENDING";

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };



    const handleDelete = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus data murid ini? Data yang dihapus tidak dapat dikembalikan.")) {
            return;
        }

        setIsDeleting(true);

        try {
            const res = await fetch(`/api/students/${student.id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                alert(data.message || "Gagal menghapus data");
                return;
            }

            router.refresh();
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus data");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className={`group flex flex-col md:flex-row items-stretch gap-4 rounded-xl bg-white dark:bg-[#1c2936] p-4 shadow-sm border ${isRejected ? 'border-red-200 dark:border-red-900 hover:border-red-500' : isVerified ? 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-500' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'} transition-all`}>
                <div
                    className={`w-full md:w-32 aspect-[4/3] md:aspect-square bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 bg-slate-200 dark:bg-slate-700 ${isRejected ? 'grayscale opacity-80' : ''}`}
                    style={{ backgroundImage: `url('${student.documents?.pasFoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.namaLengkap)}&background=random`}')` }}
                ></div>

                <div className="flex flex-1 flex-col justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                        {/* Status Badge */}
                        <div className="flex flex-wrap items-center gap-2">
                            {isVerified && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <span className="material-symbols-outlined text-[12px]">verified</span>
                                    Terverifikasi
                                </span>
                            )}
                            {isPending && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                    <span className="material-symbols-outlined text-[12px]">hourglass_empty</span>
                                    Menunggu Verifikasi
                                </span>
                            )}
                            {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                                    <span className="material-symbols-outlined text-[12px]">cancel</span>
                                    Ditolak
                                </span>
                            )}
                            <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium">
                                Update: {formatDate(student.updatedAt)}
                            </span>
                        </div>

                        {/* Rejection Message */}
                        {isRejected && student.catatanPenolakan && (
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50 mt-1">
                                <p className="text-xs text-red-800 dark:text-red-200 font-medium flex items-start gap-1.5">
                                    <span className="material-symbols-outlined text-[16px] shrink-0">info</span>
                                    Alasan: {student.catatanPenolakan}
                                </p>
                            </div>
                        )}

                        {/* Name and Actions */}
                        <div className="mt-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                    {student.namaLengkap}
                                </h3>
                                {isVerified && (
                                    <Link href="/dashboard/student/exam-card">
                                        <button className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary text-white text-[11px] font-bold hover:bg-primary/90 transition-all shadow-sm transform active:scale-95">
                                            <span className="material-symbols-outlined text-[14px]">print</span>
                                            Cetak Kartu
                                        </button>
                                    </Link>
                                )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-0.5">NISN: {student.nisn}</p>
                        </div>

                        {/* School Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 mt-0.5">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[18px]">
                                    school
                                </span>
                                <span>{student.asalSekolah || "-"}</span>
                            </div>
                            {/* Jalur Badge */}
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span className="material-symbols-outlined text-[18px]">
                                    alt_route
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {student.jalur ? student.jalur.replace(/_/g, " ") : "REGULER"}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                                <span className="material-symbols-outlined text-[16px] text-slate-400">location_on</span>
                                <span>{student.alamatLengkap ? "Alamat Terisi" : "Alamat Belum Diisi"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {isRejected ? (
                            <Link href={`/dashboard/student/add?studentId=${student.id}`}>
                                <button className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors shadow-sm shadow-primary/30">
                                    Perbaiki Data
                                </button>
                            </Link>
                        ) : (
                            <Link href={`/dashboard/student/add?studentId=${student.id}`}>
                                <button className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors">
                                    Edit
                                </button>
                            </Link>
                        )}

                        <Link href={`/dashboard/student/documents?studentId=${student.id}`}>
                            <button className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-transparent dark:border-slate-600 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors">
                                <span className="material-symbols-outlined text-[16px]">description</span>
                                Dokumen
                            </button>
                        </Link>

                        <Link href={`/dashboard/student/grades?studentId=${student.id}`}>
                            <button
                                className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-purple-50 border border-purple-200 hover:bg-purple-100 dark:bg-purple-900/10 dark:border-purple-800 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium transition-colors"
                            >
                                <span className="material-symbols-outlined text-[16px]">score</span>
                                Input Nilai
                            </button>
                        </Link>

                        {/* Print Registration Proof Button */}
                        <Link href={`/dashboard/student/registration-proof?studentId=${student.id}`}>
                            <button className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-transparent dark:border-slate-600 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors">
                                <span className="material-symbols-outlined text-[16px]">print</span>
                                Cetak Bukti
                            </button>
                        </Link>

                        {/* Delete Button */}
                        {!isVerified && (
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex items-center justify-center gap-1.5 rounded-lg h-8 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold transition-colors ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                {isDeleting ? "Hapus..." : "Hapus"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

        </>
    );
}
