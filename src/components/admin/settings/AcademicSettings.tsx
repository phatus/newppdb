"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

interface AcademicSettingsProps {
    initialData: any;
}

export default function AcademicSettings({ initialData }: AcademicSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(initialData?.isRegistrationOpen ?? true);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const academicYear = formData.get("academicYear") as string;

        // Use the state for the switch, not formData directly as checkboxes are quirky
        const res = await updateSettings({
            academicYear,
            isRegistrationOpen: isOpen
        });

        if (res.success) {
            toast.success("Pengaturan akademik berhasil disimpan");
        } else {
            toast.error(res.error || "Gagal menyimpan pengaturan");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tahun Ajaran Aktif
                </label>
                <input
                    name="academicYear"
                    type="text"
                    defaultValue={initialData?.academicYear || "2025/2026"}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                    placeholder="YYYY/YYYY"
                    required
                />
                <p className="text-xs text-slate-500 mt-1">
                    Format: 2024/2025
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">Status Pendaftaran</h4>
                    <p className="text-xs text-slate-500">
                        Buka atau tutup pendaftaran siswa baru.
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

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
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
    );
}
