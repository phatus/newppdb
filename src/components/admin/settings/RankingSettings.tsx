"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { updateRankingWeights } from "@/app/actions/settings";

interface RankingSettingsProps {
    initialData: any; // Using any because types might be stale
}

export default function RankingSettings({ initialData }: RankingSettingsProps) {
    const [isLoading, setIsLoading] = useState(false);

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

        const res = await updateRankingWeights(weights);
        if (res.success) {
            toast.success("Pengaturan bobot berhasil disimpan");
        } else {
            toast.error(res.error || "Gagal menyimpan");
        }
        setIsLoading(false);
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
