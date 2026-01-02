"use client";

import { useState } from "react";
import { createSubject, updateSubject, toggleSubjectActive, deleteSubject } from "@/app/actions/subjects";
import { useRouter } from "next/navigation";

interface Subject {
    id: string;
    name: string;
    category: string;
    order: number;
    isActive: boolean;
}

interface SubjectListProps {
    initialSubjects: Subject[];
}

export default function SubjectList({ initialSubjects }: SubjectListProps) {
    const router = useRouter();
    const [subjects, setSubjects] = useState(initialSubjects);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [category, setCategory] = useState("UMUM");
    const [order, setOrder] = useState(0);

    const openAddModal = () => {
        setCurrentSubject(null);
        setName("");
        setCategory("UMUM");
        setOrder(subjects.length + 1);
        setIsModalOpen(true);
    };

    const openEditModal = (subject: Subject) => {
        setCurrentSubject(subject);
        setName(subject.name);
        setCategory(subject.category);
        setOrder(subject.order);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload = { name, category, order: Number(order) };

        let res;
        if (currentSubject) {
            res = await updateSubject(currentSubject.id, payload);
        } else {
            res = await createSubject(payload);
        }

        if (res.success) {
            setIsModalOpen(false);
            router.refresh();
        } else {
            alert(res.error || "Terjadi kesalahan");
        }
        setIsLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        if (confirm(`Apakah Anda yakin ingin meng${currentStatus ? "nonaktifkan" : "aktifkan"} mata pelajaran ini?`)) {
            await toggleSubjectActive(id, currentStatus);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Hapus mata pelajaran? PERINGATAN: Ini akan gagal jika sudah ada nilai terkait.")) {
            const res = await deleteSubject(id);
            if (!res.success) {
                alert(res.error);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Daftar Mata Pelajaran</h3>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Tambah Mapel
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                        <tr>
                            <th className="px-6 py-3 w-16 text-center">Urutan</th>
                            <th className="px-6 py-3">Nama Mata Pelajaran</th>
                            <th className="px-6 py-3">Kategori</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {initialSubjects.map((subject) => (
                            <tr key={subject.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="px-6 py-4 text-center text-slate-900 dark:text-white font-medium">
                                    {subject.order}
                                </td>
                                <td className="px-6 py-4 text-slate-900 dark:text-white font-medium">
                                    {subject.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${subject.category === 'AGAMA' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                            subject.category === 'MULOK' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        }`}>
                                        {subject.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => handleToggle(subject.id, subject.isActive)}
                                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${subject.isActive ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${subject.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => openEditModal(subject)}
                                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subject.id)}
                                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Hapus"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">delete</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#1A2632] rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                                {currentSubject ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Nama Mapel</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Contoh: Matematika"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-semibold text-slate-900 dark:text-white">Kategori</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                >
                                    <option value="UMUM">UMUM</option>
                                    <option value="AGAMA">AGAMA</option>
                                    <option value="MULOK">MULOK</option>
                                </select>
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
