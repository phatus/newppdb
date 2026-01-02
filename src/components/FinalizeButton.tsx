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
    const [showModal, setShowModal] = useState(false);

    const handleInitialClick = () => {
        if (!isComplete) {
            toast.error("Mohon lengkapi semua dokumen terlebih dahulu.");
            return;
        }
        setShowModal(true);
    };

    const handleConfirmFinalize = async () => {
        if (!isChecked) {
            toast.error("Mohon centang pernyataan persetujuan.");
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
            setShowModal(false);
            router.push("/dashboard/student/exam-card");
            router.refresh();

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleInitialClick}
                disabled={isLoading || !isComplete}
                className={`w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${(isLoading || !isComplete) ? "opacity-50 cursor-not-allowed" : ""
                    }`}
            >
                <span className="material-symbols-outlined">lock</span>
                Finalisasi Data
            </button>

            {/* Modal Overlay */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 border-b border-amber-100 dark:border-amber-800/50 flex flex-col items-center text-center gap-4">
                            <div className="p-3 bg-amber-100 dark:bg-amber-800/40 rounded-full text-amber-600 dark:text-amber-400">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Konfirmasi Finalisasi
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Apakah Anda yakin ingin memfinalisasi data?
                                </p>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <p>
                                    <strong>Perhatian:</strong> Setelah finalisasi, seluruh data dan dokumen <span className="text-red-600 dark:text-red-400 font-bold">TIDAK DAPAT DIUBAH KEMBALI</span>. Pastikan semua informasi sudah benar.
                                </p>
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                                <div className="relative flex items-center mt-0.5">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={(e) => setIsChecked(e.target.checked)}
                                        className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary dark:bg-slate-700 dark:border-slate-600"
                                    />
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                    Saya menyatakan bahwa seluruh data dan dokumen yang saya unggah adalah benar dan dapat dipertanggungjawabkan secara hukum.
                                </span>
                            </label>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleConfirmFinalize}
                                disabled={isLoading || !isChecked}
                                className={`flex-1 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 ${(isLoading || !isChecked) ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
                                    }`}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">check_circle</span>
                                        Ya, Finalisasi Data
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
