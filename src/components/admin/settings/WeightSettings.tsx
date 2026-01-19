"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import toast from "react-hot-toast";

type PathWeights = {
    [key: string]: {
        rapor: number;
        ujian: number;
        skua: number;
        prestasi: number;
    };
};

interface WeightSettingsProps {
    initialSettings: any;
}

const PATHS = [
    { key: "REGULER", label: "Jalur Reguler" },
    { key: "PRESTASI_AKADEMIK", label: "Jalur Prestasi Akademik" },
    { key: "PRESTASI_NON_AKADEMIK", label: "Jalur Prestasi Non-Akademik" },
    { key: "AFIRMASI", label: "Jalur Afirmasi" },
] as const;

const PATH_DEFAULTS: Record<string, any> = {
    "REGULER": { rapor: 0, ujian: 50, skua: 50, prestasi: 0 },
    "AFIRMASI": { rapor: 0, ujian: 50, skua: 50, prestasi: 0 },
    "PRESTASI_AKADEMIK": { rapor: 30, ujian: 30, skua: 30, prestasi: 10 },
    "PRESTASI_NON_AKADEMIK": { rapor: 0, ujian: 30, skua: 30, prestasi: 40 },
};

export default function WeightSettings({ initialSettings }: WeightSettingsProps) {
    const [loading, setLoading] = useState(false);

    // Initialize state with existing settings or defaults
    const [weights, setWeights] = useState<PathWeights>(() => {
        const existing = initialSettings.pathWeights || {};
        const defaults: PathWeights = {};

        PATHS.forEach(path => {
            if (existing[path.key]) {
                defaults[path.key] = existing[path.key];
            } else {
                // Specific Defaults for each path
                defaults[path.key] = PATH_DEFAULTS[path.key] || {
                    rapor: 40,
                    ujian: 30,
                    skua: 30,
                    prestasi: 0
                };
            }
        });
        return defaults;
    });

    const handleChange = (pathKey: string, field: string, value: string) => {
        const numValue = parseInt(value) || 0;
        setWeights(prev => ({
            ...prev,
            [pathKey]: {
                ...prev[pathKey],
                [field]: numValue
            }
        }));
    };

    const calculateTotal = (pathKey: string) => {
        const w = weights[pathKey];
        return (w.rapor || 0) + (w.ujian || 0) + (w.skua || 0) + (w.prestasi || 0);
    };

    const handleSave = async () => {
        // Validate totals
        for (const path of PATHS) {
            const total = calculateTotal(path.key);
            if (total !== 100) {
                toast.error(`Total bobot untuk ${path.label} harus 100% (Saat ini: ${total}%)`);
                return;
            }
        }

        setLoading(true);
        try {
            const res = await updateSettings({
                pathWeights: weights
            });

            if (res.success) {
                toast.success("Pengaturan pembobotan berhasil disimpan");
            } else {
                toast.error(res.error || "Gagal menyimpan pengaturan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm flex gap-3">
                <span className="material-symbols-outlined shrink-0">info</span>
                <p>
                    Atur pembobotan nilai untuk setiap jalur pendaftaran. Total bobot untuk setiap jalur harus <strong>100%</strong>.
                    Nilai akhir siswa akan dihitung berdasarkan persentase ini.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {PATHS.map((path) => {
                    const total = calculateTotal(path.key);
                    const isInvalid = total !== 100;

                    return (
                        <div key={path.key} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-800 dark:text-white">{path.label}</h3>
                                <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1 rounded-full ${isInvalid ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                                    }`}>
                                    <span>Total: {total}%</span>
                                    {isInvalid && <span className="material-symbols-outlined text-[16px]">warning</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Rapor (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weights[path.key].rapor}
                                        onChange={(e) => handleChange(path.key, "rapor", e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Ujian Tulis (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weights[path.key].ujian}
                                        onChange={(e) => handleChange(path.key, "ujian", e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai SKUA (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weights[path.key].skua}
                                        onChange={(e) => handleChange(path.key, "skua", e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nilai Prestasi (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={weights[path.key].prestasi}
                                        onChange={(e) => handleChange(path.key, "prestasi", e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[20px]">save</span>
                            Simpan Perubahan
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
