"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FinalizeButtonProps {
    studentId: string;
    isComplete: boolean;
}

export default function FinalizeButton({ studentId, isComplete }: FinalizeButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const handleFinalize = async () => {
        if (!isComplete) {
            toast.error("Mohon lengkapi semua dokumen terlebih dahulu.");
            return;
        }
        if (!isChecked) {
            toast.error("Mohon centang pernyataan persetujuan.");
            return;
        }

        if (!confirm("Apakah Anda yakin ingin memfinalisasi data? Data tidak dapat diubah setelah ini.")) {
            return;
        }

        setIsLoading(true);
        const loadingToast = toast.loading("Memproses finalisasi data...");

        try {
            const res = await fetch(`/api/students/${studentId}/finalize`, {
                method: "POST",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Gagal memfinalisasi data");
            }

            toast.dismiss(loadingToast);
            toast.success("Data berhasil difinalisasi!");
            router.push("/dashboard/student/exam-card");
            router.refresh();

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer group">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah
                    adalah benar dan dapat dipertanggungjawabkan sesuai hukum yang
                    berlaku.
                </span>
            </label>

            <button
                onClick={handleFinalize}
                disabled={isLoading || !isComplete || !isChecked}
                className={`w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(isLoading || !isComplete || !isChecked) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                {isLoading ? (
                    <>
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        Memproses...
                    </>
                ) : (
                    <>
                        <span className="material-symbols-outlined">lock</span>
                        Finalisasi Data
                    </>
                )}
            </button>
        </div>
    );
}
