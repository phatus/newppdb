"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateRankingWeights, updateSettings } from "@/app/actions/settings";
import { updateRankingSnapshot } from "@/app/actions/ranking";

interface RankingSettingsProps {
    initialData: any; // Using any because types might be stale
}

export default function RankingSettings({ initialData }: RankingSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdatingSnapshot, setIsUpdatingSnapshot] = useState(false);

    // Visibility toggles
    const [isRankingLive, setIsRankingLive] = useState((initialData as any)?.isRankingLive ?? true);
    const [showRankingScores, setShowRankingScores] = useState((initialData as any)?.showRankingScores ?? true);

    // Configurable weights
    const [weights, setWeights] = useState({
        weightRapor: initialData?.weightRapor ?? 40,
        weightUjian: initialData?.weightUjian ?? 30,
        weightSKUA: initialData?.weightSKUA ?? 30
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 0;
        setWeights({ ...weights, [e.target.name]: val });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const total = weights.weightRapor + weights.weightUjian + weights.weightSKUA;
        if (total !== 100) {
            toast.error(`Total bobot harus 100%. Saat ini: ${total}%`);
            setIsLoading(false);
            return;
        }

        // Save weights
        const resWeights = await updateRankingWeights(weights);
        
        // Save toggles
        const resSettings = await updateSettings({
            isRankingLive,
            showRankingScores
        });

        if (resWeights.success && resSettings.success) {
            toast.success("Pengaturan ranking berhasil disimpan");
        } else {
            toast.error("Gagal menyimpan beberapa pengaturan");
        }
        setIsLoading(false);
    };

    const handleUpdateSnapshot = async () => {
        setIsUpdatingSnapshot(true);
        const res = await updateRankingSnapshot();
        if (res.success) {
            toast.success("Data ranking berhasil diperbarui ke publik");
        } else {
            toast.error(res.error || "Gagal memperbarui data ranking");
        }
        setIsUpdatingSnapshot(false);
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                    <span>
                        Tentukan persentase bobot untuk setiap komponen penilaian dalam menghitung Skor Akhir murid.
                        Total bobot harus 100%. Prestasi akan ditambahkan sebagai poin bonus (non-persentase).
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Bobot Nilai Rapor (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="weightRapor"
                            value={weights.weightRapor}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="absolute right-3 top-2 text-slate-400 font-bold">%</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Rata-rata nilai rapor semester 1-5.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Bobot Ujian Teori (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="weightUjian"
                            value={weights.weightUjian}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="absolute right-3 top-2 text-slate-400 font-bold">%</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Nilai tes tulis / akademik.</p>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Bobot Ujian SKUA (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            name="weightSKUA"
                            value={weights.weightSKUA}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="absolute right-3 top-2 text-slate-400 font-bold">%</div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Standar Kecakapan Ubudiyah & Akhlak.</p>
                </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                    Kontrol Tampilan Publik
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h5 className="font-medium text-slate-900 dark:text-white">Mode Live Score</h5>
                            <p className="text-xs text-slate-500">
                                {isRankingLive ? "Skor terupdate otomatis secara real-time." : "Skor hanya update saat tombol 'Update' ditekan."}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsRankingLive(!isRankingLive)}
                            className={`${isRankingLive ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        >
                            <span className={`${isRankingLive ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <div>
                            <h5 className="font-medium text-slate-900 dark:text-white">Tampilkan Nilai</h5>
                            <p className="text-xs text-slate-500">Tampilkan poin skor akhir di tabel ranking publik.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowRankingScores(!showRankingScores)}
                            className={`${showRankingScores ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        >
                            <span className={`${showRankingScores ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                </div>

                {!isRankingLive && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                            <div className="text-sm text-amber-800 dark:text-amber-300">
                                <b>Mode Beku (Frozen) Aktif:</b> Nilai di halaman publik tidak akan berubah sampai Anda menekan tombol update di samping.
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleUpdateSnapshot}
                            disabled={isUpdatingSnapshot}
                            className="whitespace-nowrap px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isUpdatingSnapshot ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-[18px]">publish</span>
                            )}
                            Update Data Publik
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="text-sm font-bold">
                    Total Bobot: <span className={`${weights.weightRapor + weights.weightUjian + weights.weightSKUA === 100 ? 'text-green-600' : 'text-red-500'}`}>
                        {weights.weightRapor + weights.weightUjian + weights.weightSKUA}%
                    </span>
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                        {isLoading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        Simpan Bobot
                    </button>
                </div>
            </div>
        </form>
    );
}
