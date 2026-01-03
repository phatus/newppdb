"use client";

import { useState } from "react";
import { createSemester, updateSemester, toggleSemesterActive, deleteSemester } from "@/app/actions/semesters";
import { useRouter } from "next/navigation";
import { Semester } from "@prisma/client";

interface SemesterManagerProps {
    initialSemesters: Semester[];
}

export default function SemesterManager({ initialSemesters }: SemesterManagerProps) {
    const router = useRouter();
    // Use local state if initialSemesters is passed, but rely on router.refresh() for real updates
    // For simplicity, we can just use the prop directly if the parent passes updated data on refresh,
    // but a local state is safer for immediate feedback if optimistic UI isn't fully implemented.
    // However, since we use router.refresh() in SubjectList, we'll assume the parent component refreshes/re-renders with new props.
    // Wait, SubjectList uses local state initialized from props. Let's stick to that pattern for consistency.
    const [semesters, setSemesters] = useState(initialSemesters);

    // Update local state when props change (optional, but good practice if parent re-renders)
    // Actually, simpler to just use router.refresh() and let Next.js handle it, 
    // but SubjectList structure uses `useState(initialSubjects)`.
    // We will follow the SubjectList pattern.

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [order, setOrder] = useState(0);

    const openAddModal = () => {
        setCurrentSemester(null);
        setName("");
        setOrder(initialSemesters.length + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (semester: Semester) => {
        setCurrentSemester(semester);
        setName(semester.name);
        setOrder(semester.order);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = { name, order: Number(order) };

        let res;
        if (currentSemester) {
            res = await updateSemester(currentSemester.id, payload);
        } else {
            res = await createSemester(payload);
        }

        if (res.success) {
            setIsModalOpen(false);
            router.refresh();
            // In a real app we'd update local state here too for instant feedback, 
            // but router.refresh() + page re-fetch is standard Next.js 13+ RSC pattern.
            // SubjectList might act slightly weird if it doesn't sync with props.
            // We'll rely on the page reload which is triggered by router.refresh().
        } else {
            alert(res.error || "Terjadi kesalahan");
        }
        setIsLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        if (confirm(`Apakah Anda yakin ingin meng${currentStatus ? "nonaktifkan" : "aktifkan"} semester ini?`)) {
            await toggleSemesterActive(id, currentStatus);
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus semester? PERINGATAN: Ini akan gagal jika sudah ada nilai terkait.")) {
            const res = await deleteSemester(id);
            if (!res.success) {
                alert(res.error);
            } else {
                router.refresh();
            }
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daftar Semester</h3>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Semester
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3 w-16 text-center">Urutan</th>
                            <th className="px-6 py-3">Nama Semester</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {initialSemesters.map((semester) => (
                            <tr key={semester.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 text-center text-slate-900 dark:text-white font-medium">
                                    {semester.order}
                                </td>
                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                    {semester.name}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggle(semester.id, semester.isActive)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${semester.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${semester.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEditModal(semester)}
                                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(semester.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {initialSemesters.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                    Belum ada data semester.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1A2632] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {currentSemester ? "Edit Semester" : "Tambah Semester"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Nama Semester</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Contoh: Kelas 1 Semester 1"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Urutan</label>
                                <input
                                    type="number"
                                    required
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isLoading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
