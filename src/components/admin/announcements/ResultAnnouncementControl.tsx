"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface ResultAnnouncementControlProps {
    initialStatus: boolean;
}

export default function ResultAnnouncementControl({ initialStatus }: ResultAnnouncementControlProps) {
    const [isPublished, setIsPublished] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async () => {
        setLoading(true);
        const newStatus = !isPublished;
        
        try {
            const res = await updateSettings({
                isResultsPublished: newStatus
            });

            if (res.success) {
                setIsPublished(newStatus);
                toast.success(newStatus 
                    ? "Hasil seleksi berhasil dipublikasikan ke siswa" 
                    : "Publikasi hasil seleksi ditarik kembali"
                );
                router.refresh();
            } else {
                toast.error(res.error || "Gagal memperbarui status pengumuman");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">campaign</span>
                    Pengumuman Kelulusan Serentak
                </h4>
                {loading && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
            </div>
            
            <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {isPublished 
                            ? "Hasil seleksi saat ini SEDANG DIPUBLIKASIKAN. Siswa dapat melihat status Diterima/Tidak Diterima di dashboard mereka."
                            : "Hasil seleksi saat ini DISEMBUNYIKAN. Siswa belum bisa melihat status kelulusan."
                        }
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`flex h-2 w-2 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isPublished ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {isPublished ? 'Aktif / Published' : 'Non-Aktif / Draft'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={loading}
                    onClick={handleToggle}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                        isPublished 
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-slate-200/50 dark:bg-slate-800 dark:text-slate-300" 
                        : "bg-primary hover:bg-primary/90 text-white shadow-primary/25"
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {isPublished ? 'visibility_off' : 'rocket_launch'}
                    </span>
                    {isPublished ? 'Tarik Pengumuman' : 'Publikasikan Sekarang'}
                </button>
            </div>

            {!isPublished && (
                <div className="px-5 pb-5">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 p-3 rounded-lg flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                            <b>Penting:</b> Pastikan proses seleksi otomatis dan verifikasi manual sudah selesai sebelum mempublikasikan hasil ini secara serentak.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
