"use client";

import { useState } from "react";
import { createWave, updateWave, deleteWave } from "@/app/actions/waves";
import { updateSettings } from "@/app/actions/settings";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import toast from "react-hot-toast";

interface Wave {
    id: string;
    name: string;
    description: string | null;
    startDate: string | Date; // Serialized date from server or Date object
    endDate: string | Date;
    isActive: boolean;
    jalurAllowed: any;
    quota: number;
    pathQuotas: any;
    _count?: { students: number };
}

const JALUR_OPTIONS = [
    { value: "REGULER", label: "Reguler" },
    { value: "PRESTASI_AKADEMIK", label: "Prestasi Akademik" },
    { value: "PRESTASI_NON_AKADEMIK", label: "Prestasi Non-Akademik" },
    { value: "AFIRMASI", label: "Afirmasi" },
];

export default function WaveManager({ initialWaves, settings }: { initialWaves: any[], settings: any }) {
    const [waves, setWaves] = useState<Wave[]>(initialWaves);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [showQuota, setShowQuota] = useState(settings?.showQuota ?? true);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        jalurAllowed: [] as string[],
        quota: 0,
        pathQuotas: {} as Record<string, number>,
        isActive: true
    });

    const handleUpdateGlobalSettings = async (val: boolean) => {
        setIsSavingSettings(true);
        const result = await updateSettings({ showQuota: val });
        if (result.success) {
            setShowQuota(val);
            toast.success("Pengaturan kuota diperbarui");
        } else {
            toast.error("Gagal memperbarui pengaturan");
        }
        setIsSavingSettings(false);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            startDate: "",
            endDate: "",
            jalurAllowed: [],
            quota: 0,
            pathQuotas: {},
            isActive: true
        });
        setIsEditing(null);
    };

    const handleEdit = (wave: Wave) => {
        setIsEditing(wave.id);
        setFormData({
            name: wave.name,
            description: wave.description || "",
            startDate: new Date(wave.startDate).toISOString().split('T')[0],
            endDate: new Date(wave.endDate).toISOString().split('T')[0],
            jalurAllowed: Array.isArray(wave.jalurAllowed) ? wave.jalurAllowed : [],
            quota: wave.quota || 0,
            pathQuotas: (wave.pathQuotas as Record<string, number>) || {},
            isActive: wave.isActive
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this wave?")) return;

        const result = await deleteWave(id);
        if (result.success) {
            toast.success("Gelombang dihapus");
            setWaves(prev => prev.filter(w => w.id !== id));
        } else {
            toast.error(result.error || "Gagal menghapus");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.jalurAllowed.length === 0) {
            toast.error("Pilih minimal satu jalur pendaftaran");
            return;
        }

        const allocated = formData.jalurAllowed.reduce((acc, jalur) => acc + (formData.pathQuotas[jalur] || 0), 0);
        if (allocated !== formData.quota) {
            toast.error(`Total alokasi jalur (${allocated}) harus sama dengan total kuota (${formData.quota})`);
            return;
        }

        const payload = {
            ...formData,
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate)
        };

        if (isEditing) {
            const result = await updateWave(isEditing, payload);
            if (result.success) {
                toast.success("Gelombang diperbarui");
                setWaves(prev => prev.map(w => w.id === isEditing ? { ...w, ...result.data, _count: w._count } as Wave : w));
                resetForm();
            } else {
                toast.error(result.error || "Gagal update");
            }
        } else {
            const result = await createWave(payload);
            if (result.success) {
                toast.success("Gelombang dibuat");
                setWaves(prev => [...prev, result.data as Wave]);
                resetForm();
            } else {
                toast.error(result.error || "Gagal membuat");
            }
        }
    };

    const toggleJalur = (value: string) => {
        setFormData(prev => {
            const current = prev.jalurAllowed;
            if (current.includes(value)) {
                return { ...prev, jalurAllowed: current.filter(v => v !== value) };
            } else {
                return { ...prev, jalurAllowed: [...current, value] };
            }
        });
    };

    const totalSchoolQuota = waves.reduce((acc, wave) => acc + (wave.quota || 0), 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Quota Summary */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">groups</span>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Kuota Sekolah (Semua Gelombang)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalSchoolQuota} <span className="text-sm font-medium text-slate-400">Siswa</span></h3>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400">Terdiri dari {waves.length} Gelombang</p>
                    </div>
                </div>

                {/* Show Quota Toggle */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Publikasi Kuota</h4>
                        <div className={`w-2 h-2 rounded-full ${showQuota ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">Tampilkan info sisa kuota di halaman publik.</p>
                    <button
                        onClick={() => handleUpdateGlobalSettings(!showQuota)}
                        disabled={isSavingSettings}
                        className={`w-full py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${showQuota
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        {isSavingSettings ? (
                            <span className="animate-spin material-symbols-outlined text-[16px]">sync</span>
                        ) : (
                            <span className="material-symbols-outlined text-[16px]">{showQuota ? 'visibility' : 'visibility_off'}</span>
                        )}
                        {showQuota ? 'Aktif (Terlihat)' : 'Nonaktif (Sembunyi)'}
                    </button>
                </div>
            </div>

            {/* Form Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">
                    {isEditing ? "Edit Gelombang" : "Buat Gelombang Baru"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Gelombang</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Gelombang 1 - Jalur Prestasi"
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Keterangan (Opsional)</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Keterangan singkat..."
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Mulai</label>
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Selesai</label>
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Total Kuota (Siswa)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    required
                                    value={formData.quota}
                                    onChange={e => setFormData({ ...formData, quota: parseInt(e.target.value) || 0 })}
                                    placeholder="Contoh: 128"
                                    className="grow px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-primary/20"
                                    min="0"
                                />
                                <div className="flex-none p-2 px-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center gap-2 group relative">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">info</span>
                                    <span className="text-[10px] font-bold text-slate-500">Estimasi</span>
                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg invisible group-hover:visible z-10">
                                        Gunakan tombol di bawah untuk mengisi kuota berdasarkan jumlah kelas (Basis: {settings?.studentsPerClass || 32} siswa/kelas)
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {[1, 2, 3, 4, 5, 8].map(count => (
                                    <button
                                        key={count}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, quota: count * (settings?.studentsPerClass || 32) })}
                                        className="px-2 py-1 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-slate-600 dark:text-slate-400 transition-all"
                                    >
                                        {count} Kelas ({count * (settings?.studentsPerClass || 32)})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jalur Pendaftaran & Kuota</label>

                            {/* Allocation Logic & UI */}
                            {(() => {
                                const allocated = formData.jalurAllowed.reduce((acc, jalur) => acc + (formData.pathQuotas[jalur] || 0), 0);
                                const diff = formData.quota - allocated;

                                return (
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${diff === 0
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : diff > 0
                                                ? 'bg-amber-50 text-amber-600 border-amber-200'
                                                : 'bg-red-50 text-red-600 border-red-200'
                                            }`}>
                                            Alokasi: {allocated} / {formData.quota}
                                        </div>
                                        {diff !== 0 && (
                                            <span className={`text-[10px] font-bold ${diff > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {diff > 0 ? `Sisa: ${diff}` : `Lebih: ${Math.abs(diff)}`}
                                            </span>
                                        )}
                                        {diff === 0 && (
                                            <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {JALUR_OPTIONS.map(option => {
                                const isSelected = formData.jalurAllowed.includes(option.value);
                                return (
                                    <div key={option.value} className={`p-4 rounded-xl border transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id={`jalur-${option.value}`}
                                                    checked={isSelected}
                                                    onChange={() => toggleJalur(option.value)}
                                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`jalur-${option.value}`} className="text-sm font-bold text-slate-900 dark:text-white cursor-pointer">
                                                    {option.label}
                                                </label>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-400">Kuota Jalur</label>
                                                <input
                                                    type="number"
                                                    value={formData.pathQuotas[option.value] || 0}
                                                    onChange={e => {
                                                        const val = parseInt(e.target.value) || 0;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            pathQuotas: { ...prev.pathQuotas, [option.value]: val }
                                                        }));
                                                    }}
                                                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                                                    min="0"
                                                    placeholder="0"
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <p className="text-xs text-slate-500">Aktifkan jalur yang dibuka dan tentukan kuota masing-masing. Jika kuota diisi 0, maka akan menggunakan kuota global.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            id="isActive"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Aktif</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-lg transition-colors"
                        >
                            {isEditing ? "Simpan Perubahan" : "Buat Gelombang"}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {waves.map((wave) => {
                    const now = new Date();
                    const start = new Date(wave.startDate);
                    const end = new Date(wave.endDate);
                    const isOpen = wave.isActive && now >= start && now <= end;

                    return (
                        <div key={wave.id} className={`relative p-6 rounded-xl border ${isOpen ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'} transition-all`}>
                            {isOpen && (
                                <div className="absolute top-4 right-4 px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wide">
                                    Sedang Berjalan
                                </div>
                            )}

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{wave.name}</h3>
                            <p className="text-sm text-slate-500 mb-4">{wave.description || "Tidak ada keterangan"}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">date_range</span>
                                    <span>
                                        {format(start, "d MMM yyyy", { locale: idLocale })} - {format(end, "d MMM yyyy", { locale: idLocale })}
                                    </span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400 mt-0.5">alt_route</span>
                                    <div className="flex flex-wrap gap-1">
                                        {(wave.jalurAllowed as string[]).map((jalur: string) => {
                                            const pQuotas = (wave.pathQuotas as Record<string, number>) || {};
                                            const pq = pQuotas[jalur];
                                            return (
                                                <span key={jalur} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold">
                                                    {jalur.replace(/_/g, " ")} {pq > 0 ? `(${pq})` : ""}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                                <button
                                    onClick={() => handleEdit(wave)}
                                    className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(wave.id)}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    );
                })}

                {waves.length === 0 && (
                    <div className="col-span-full p-10 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl text-slate-500">
                        Belum ada gelombang pendaftaran.
                    </div>
                )}
            </div>
        </div>
    );
}
