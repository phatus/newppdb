"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { startNewAcademicYear } from "@/app/actions/academic-year";
import { toast } from "react-hot-toast";

interface AcademicSettingsProps {
    initialData: Record<string, unknown> | null;
}

export default function AcademicSettings({ initialData }: AcademicSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState<boolean>(Boolean(initialData?.isRegistrationOpen ?? true));

    // Modal state for rollover new academic year
    const [showRolloverModal, setShowRolloverModal] = useState(false);
    const [newYearInput, setNewYearInput] = useState("");
    const [newWaveName, setNewWaveName] = useState("");
    const [isRolloverLoading, setIsRolloverLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const academicYear = formData.get("academicYear") as string;

        const res = await updateSettings({
            academicYear,
            isRegistrationOpen: isOpen,
        });

        if (res.success) {
            toast.success("Pengaturan akademik berhasil disimpan");
        } else {
            toast.error(res.error || "Gagal menyimpan pengaturan");
        }
        setLoading(false);
    };

    const handleRolloverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newYearInput.trim()) {
            toast.error("Tahun Pelajaran baru harus diisi");
            return;
        }

        setIsRolloverLoading(true);
        try {
            const res = await startNewAcademicYear({
                newAcademicYear: newYearInput.trim(),
                createFirstWave: true,
                waveName: newWaveName.trim() || `Gelombang 1 (${newYearInput.trim()})`,
            });

            if (res.success) {
                toast.success(res.message || "Berhasil membuka tahun pelajaran baru!");
                setShowRolloverModal(false);
                setNewYearInput("");
                setNewWaveName("");
                window.location.reload();
            } else {
                toast.error(res.error || "Gagal membuka tahun pelajaran baru");
            }
        } catch (err) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsRolloverLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tahun Ajaran Aktif
                    </label>
                    <input
                        name="academicYear"
                        type="text"
                        defaultValue={initialData?.academicYear || "2025/2026"}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
                        placeholder="YYYY/YYYY"
                        required
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Format: 2025/2026
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-slate-900 dark:text-white text-sm">Status Pendaftaran</h4>
                        <p className="text-xs text-slate-500">
                            Buka atau tutup pendaftaran murid baru.
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isOpen}
                        onClick={() => setIsOpen(!isOpen)}
                        className={`${isOpen ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2`}
                    >
                        <span
                            className={`${isOpen ? "translate-x-6" : "translate-x-1"
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                Menyimpan...
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </button>
                </div>
            </form>

            {/* Rollover New Academic Year Banner / Action */}
            <div className="p-5 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-3">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">published_with_changes</span>
                    <div>
                        <h4 className="font-bold text-amber-900 dark:text-amber-200 text-sm">Buka Pendaftaran Tahun Pelajaran Baru (Rollover)</h4>
                        <p className="text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed mt-1">
                            Gunakan fitur ini ketika memasuki periode PPDB tahun pelajaran baru (misal: 2026/2027). Sistem akan mengarsipkan data pendaftar tahun sebelumnya dengan aman dan membuat pendaftaran tahun baru secara bersih.
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        const currentYear = initialData?.academicYear || "2025/2026";
                        const parts = currentYear.split("/");
                        let suggestedYear = "";
                        if (parts.length === 2 && !isNaN(Number(parts[0]))) {
                            suggestedYear = `${Number(parts[0]) + 1}/${Number(parts[1]) + 1}`;
                        } else {
                            suggestedYear = "2026/2027";
                        }
                        setNewYearInput(suggestedYear);
                        setNewWaveName(`Gelombang 1 (${suggestedYear})`);
                        setShowRolloverModal(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                    Buka Tahun Pelajaran Baru
                </button>
            </div>

            {/* Rollover Modal */}
            {showRolloverModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">auto_mode</span>
                                Buka Tahun Pelajaran Baru
                            </h3>
                            <button
                                onClick={() => setShowRolloverModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleRolloverSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Tahun Pelajaran Baru
                                </label>
                                <input
                                    type="text"
                                    value={newYearInput}
                                    onChange={(e) => setNewYearInput(e.target.value)}
                                    placeholder="misal: 2026/2027"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Nama Gelombang Utama Pertama
                                </label>
                                <input
                                    type="text"
                                    value={newWaveName}
                                    onChange={(e) => setNewWaveName(e.target.value)}
                                    placeholder="misal: Gelombang 1 (2026/2027)"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                                />
                            </div>

                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-lg text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                                🔒 Data pendaftar tahun <strong>{initialData?.academicYear || "sebelumnya"}</strong> akan tetap tersimpan sebagai <strong>Arsip Read-Only</strong> yang dapat diakses kapan saja dari filter Tahun Pelajaran.
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRolloverModal(false)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRolloverLoading}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isRolloverLoading ? (
                                        <>
                                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Memproses...
                                        </>
                                    ) : (
                                        "Konfirmasi Buka T.P Baru"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

