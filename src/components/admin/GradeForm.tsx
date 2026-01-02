"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { updateStudentScore } from "@/app/actions/ranking";
import { useRouter } from "next/navigation";

interface GradeFormProps {
    studentId: string;
    initialGrades: {
        nilaiUjianTeori?: number | null;
        nilaiUjianSKUA?: number | null;
        rataRataNilai?: number | null;
    };
}

export default function GradeForm({ studentId, initialGrades }: GradeFormProps) {
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState({
        nilaiUjianTeori: initialGrades.nilaiUjianTeori || 0,
        nilaiUjianSKUA: initialGrades.nilaiUjianSKUA || 0,
        rataRataNilai: initialGrades.rataRataNilai || 0,
    });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setGrades(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = {
                theory: grades.nilaiUjianTeori,
                skua: grades.nilaiUjianSKUA,
                // achievement: 0 // Optional, not in this form yet
            };

            const result = await updateStudentScore(studentId, formData);

            if (result.success) {
                toast.success("Nilai berhasil disimpan");
                router.refresh();
            } else {
                toast.error(result.error || "Gagal menyimpan nilai");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ujian Teori
                    </label>
                    <input
                        type="number"
                        name="nilaiUjianTeori"
                        value={grades.nilaiUjianTeori}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Ujian SKUA
                    </label>
                    <input
                        type="number"
                        name="nilaiUjianSKUA"
                        value={grades.nilaiUjianSKUA}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={loading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nilai Raport
                    </label>
                    <input
                        type="number"
                        name="rataRataNilai"
                        value={grades.rataRataNilai}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        max="100"
                        className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? (
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-lg">save</span>
                    )}
                    Simpan Nilai
                </button>
            </div>
        </form>
    );
}
