"use client";

import { useEffect, useState } from "react";

interface VerificationActionModalProps {
    isOpen: boolean;
    type: "VERIFY" | "REJECT" | null;
    onClose: () => void;
    onConfirm: (note?: string) => void;
    isLoading: boolean;
}

export default function VerificationActionModal({
    isOpen,
    type,
    onClose,
    onConfirm,
    isLoading
}: VerificationActionModalProps) {
    const [note, setNote] = useState("");

    // Reset note when opening
    useEffect(() => {
        if (isOpen) setNote("");
    }, [isOpen]);

    if (!isOpen || !type) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-6 text-center ${type === 'VERIFY' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'VERIFY' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                        }`}>
                        <span className="material-symbols-outlined text-4xl">
                            {type === 'VERIFY' ? 'verified' : 'gpp_bad'}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {type === 'VERIFY' ? 'Verifikasi Murid' : 'Tolak Pendaftaran'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                        {type === 'VERIFY'
                            ? 'Apakah Anda yakin semua dokumen valid? Murid akan menerima notifikasi diterima.'
                            : 'Murid akan menerima notifikasi penolakan. Harap berikan alasan yang jelas.'}
                    </p>
                </div>

                <div className="p-6">
                    {type === 'REJECT' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Alasan Penolakan <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Contoh: Dokumen KK buram, mohon upload ulang..."
                                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none text-sm"
                            ></textarea>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => onConfirm(type === 'REJECT' ? note : undefined)}
                            disabled={isLoading || (type === 'REJECT' && !note.trim())}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${type === 'VERIFY'
                                ? 'bg-primary hover:bg-blue-700 hover:shadow-blue-500/25'
                                : 'bg-red-600 hover:bg-red-700 hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed'
                                }`}
                        >
                            {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {type === 'VERIFY' ? 'Ya, Verifikasi' : 'Tolak Murid'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
