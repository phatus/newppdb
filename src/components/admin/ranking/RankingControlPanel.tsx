"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateSettings } from "@/app/actions/settings";
import { updateRankingSnapshot } from "@/app/actions/ranking";
import { useRouter } from "next/navigation";

interface RankingControlPanelProps {
    isRankingLive: boolean;
    showRankingScores: boolean;
}

export default function RankingControlPanel({ 
    isRankingLive: initialLive, 
    showRankingScores: initialShow 
}: RankingControlPanelProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingSnapshot, setIsUpdatingSnapshot] = useState(false);
    const [isRankingLive, setIsRankingLive] = useState(initialLive);
    const [showRankingScores, setShowRankingScores] = useState(initialShow);

    const handleToggle = async (type: 'live' | 'show') => {
        setIsLoading(true);
        const newLive = type === 'live' ? !isRankingLive : isRankingLive;
        const newShow = type === 'show' ? !showRankingScores : showRankingScores;

        const res = await updateSettings({
            isRankingLive: newLive,
            showRankingScores: newShow
        });

        if (res.success) {
            if (type === 'live') setIsRankingLive(newLive);
            if (type === 'show') setShowRankingScores(newShow);
            toast.success("Pengaturan berhasil diperbarui");
            router.refresh();
        } else {
            toast.error("Gagal memperbarui pengaturan");
        }
        setIsLoading(false);
    };

    const handleUpdateSnapshot = async () => {
        setIsUpdatingSnapshot(true);
        const res = await updateRankingSnapshot();
        if (res.success) {
            toast.success("Data ranking publik berhasil diperbarui");
            router.refresh();
        } else {
            toast.error(res.error || "Gagal memperbarui data");
        }
        setIsUpdatingSnapshot(false);
    };

    return (
        <div className="bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-primary">visibility</span>
                    Kontrol Tampilan Publik
                </h4>
                {isLoading && <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
            </div>

            <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Mode Live Score</h5>
                            <p className="text-[10px] text-slate-500">
                                {isRankingLive ? "Skor terupdate otomatis secara real-time." : "Skor hanya update saat tombol 'Update' ditekan."}
                            </p>
                        </div>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggle('live')}
                            className={`${isRankingLive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                } relative inline-flex h-5 w-10 items-center rounded-full transition-colors disabled:opacity-50`}
                        >
                            <span className={`${isRankingLive ? "translate-x-5" : "translate-x-1"} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white">Tampilkan Nilai</h5>
                            <p className="text-[10px] text-slate-500">Tampilkan poin skor akhir di tabel ranking publik.</p>
                        </div>
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggle('show')}
                            className={`${showRankingScores ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                } relative inline-flex h-5 w-10 items-center rounded-full transition-colors disabled:opacity-50`}
                        >
                            <span className={`${showRankingScores ? "translate-x-5" : "translate-x-1"} inline-block h-3 w-3 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                </div>

                {!isRankingLive && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
                            <div className="text-xs text-amber-800 dark:text-amber-300">
                                <b>Mode Beku Aktif:</b> Nilai publik tidak akan berubah sampai tombol di samping ditekan.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdateSnapshot}
                            disabled={isUpdatingSnapshot}
                            className="whitespace-nowrap px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isUpdatingSnapshot ? (
                                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[16px]">publish</span>
                            )}
                            Update Data Publik
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
