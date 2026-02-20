"use client";

import { useState } from "react";
import { createWave, updateWave, deleteWave } from "@/app/actions/waves";
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
    _count?: { students: number };
}

const JALUR_OPTIONS = [
    { value: "REGULER", label: "Reguler" },
    { value: "PRESTASI_AKADEMIK", label: "Prestasi Akademik" },
    { value: "PRESTASI_NON_AKADEMIK", label: "Prestasi Non-Akademik" },
    { value: "AFIRMASI", label: "Afirmasi" },
];

export default function WaveManager({ initialWaves }: { initialWaves: any[] }) {
    const [waves, setWaves] = useState<Wave[]>(initialWaves);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        jalurAllowed: [] as string[],
        isActive: true
    });

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            startDate: "",
            endDate: "",
            jalurAllowed: [],
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

    return (
        <div className="space-y-8">
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
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Jalur Pendaftaran Dibuka</label>
                        <div className="flex flex-wrap gap-3">
                            {JALUR_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggleJalur(option.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${formData.jalurAllowed.includes(option.value)
                                        ? "bg-primary text-white border-primary"
                                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-primary/50"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500">Pilih jalur apa saja yang bisa mendaftar pada gelombang ini.</p>
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
                                        {(wave.jalurAllowed as string[]).map((jalur: string) => (
                                            <span key={jalur} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                                                {jalur.replace(/_/g, " ")}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-[18px] text-slate-400">group</span>
                                    <span>{wave._count?.students || 0} Pendaftar</span>
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
