"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import toast from "react-hot-toast";

interface QuotaSettingsProps {
    settings: any;
}

export default function QuotaSettings({ settings }: QuotaSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [quotas, setQuotas] = useState({
        studentQuota: settings?.studentQuota || 100, // Total
        quotaReguler: settings?.quotaReguler || 50,
        quotaPrestasiAkademik: settings?.quotaPrestasiAkademik || 15,
        quotaPrestasiNonAkademik: settings?.quotaPrestasiNonAkademik || 15,
        quotaAfirmasi: settings?.quotaAfirmasi || 20,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuotas(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await updateSettings({
                ...settings,
                ...quotas
            });

            if (result.success) {
                toast.success("Pengaturan kuota berhasil disimpan");
            } else {
                toast.error(result.error || "Gagal menyimpan pengaturan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    const totalAllocated = quotas.quotaReguler + quotas.quotaPrestasiAkademik + quotas.quotaPrestasiNonAkademik + quotas.quotaAfirmasi;
    const isMismatch = totalAllocated !== quotas.studentQuota;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5">info</span>
                    <div className="text-sm">
                        <p className="font-bold mb-1">Informasi Kuota</p>
                        <p>Kuota ini digunakan sebagai batas penerimaan siswa (Ranking), bukan batas pendaftaran. Jalur Afirmasi yang tidak lolos dapat masuk ke kuota Reguler jika nilainya mencukupi (tergantung implementasi ranking).</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Total Kuota Penerimaan</label>
                    <input
                        type="number"
                        name="studentQuota"
                        value={quotas.studentQuota}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                        min="0"
                    />
                    <p className="text-xs text-slate-500">Jumlah total siswa yang akan diterima.</p>
                </div>

                <div className="space-y-4 md:col-span-2 border-t border-slate-200 pt-4">
                    <h3 className="font-bold text-slate-900">Alokasi Per Jalur</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Jalur Reguler / Zonasi</label>
                            <input
                                type="number"
                                name="quotaReguler"
                                value={quotas.quotaReguler}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Prestasi Akademik</label>
                            <input
                                type="number"
                                name="quotaPrestasiAkademik"
                                value={quotas.quotaPrestasiAkademik}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Prestasi Non-Akademik</label>
                            <input
                                type="number"
                                name="quotaPrestasiNonAkademik"
                                value={quotas.quotaPrestasiNonAkademik}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700">Jalur Afirmasi</label>
                            <input
                                type="number"
                                name="quotaAfirmasi"
                                value={quotas.quotaAfirmasi}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Validation Warning */}
                    <div className={`flex items-center justify-between p-3 rounded-lg border ${isMismatch
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700"
                        }`}>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">
                                {isMismatch ? "warning" : "check_circle"}
                            </span>
                            <span className="text-sm font-bold">
                                Total Alokasi: {totalAllocated} / {quotas.studentQuota}
                            </span>
                        </div>
                        {isMismatch && (
                            <span className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                                {totalAllocated > quotas.studentQuota ? "Melebihi Total" : "Kurang dari Total"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined">save</span>
                    )}
                    Simpan Pengaturan
                </button>
            </div>
        </form>
    );
}
