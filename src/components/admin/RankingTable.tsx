"use client";

import { useState } from "react";
import { updateStudentScore } from "@/app/actions/ranking";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateAdmissionStatus } from "@/app/actions/verification";

export default function RankingTable({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        theory: 0,
        skua: 0,
        achievement: 0
    });
    const [loading, setLoading] = useState(false);

    const handleEdit = (student: any) => {
        setEditingId(student.id);
        setEditForm({
            theory: student.grades?.nilaiUjianTeori || 0,
            skua: student.grades?.nilaiUjianSKUA || 0,
            achievement: student.grades?.nilaiPrestasi || 0
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!editingId) return;
            const res = await updateStudentScore(editingId, editForm);
            if (res.success) {
                toast.success("Nilai berhasil disimpan");
                setEditingId(null);
                router.refresh();
            } else {
                toast.error(res.error || "Gagal simpan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-800/50">
                        <th className="p-4 w-16 text-center">#</th>
                        <th className="p-4">Nama Siswa</th>
                        <th className="p-4">Asal Sekolah</th>
                        <th className="p-4 text-center">Rapor (Avg)</th>
                        <th className="p-4 text-center">Teori</th>
                        <th className="p-4 text-center">SKUA</th>
                        <th className="p-4 text-center">Prestasi</th>
                        <th className="p-4 text-center text-primary">Skor Akhir</th>
                        <th className="p-4 text-center">Hasil</th>
                        <th className="p-4 text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {initialData.length === 0 ? (
                        <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-500">Belum ada siswa terverifikasi.</td>
                        </tr>
                    ) : (
                        initialData.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{student.namaLengkap}</div>
                                    <div className="text-xs text-slate-500">{student.nisn}</div>
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{student.asalSekolah}</td>

                                <td className="p-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                    {student.grades?.rataRataNilai?.toFixed(2) || "-"}
                                </td>

                                {/* Input / Display Columns */}
                                {editingId === student.id ? (
                                    <>
                                        <td className="p-2 text-center">
                                            <input
                                                type="number"
                                                className="w-16 p-1 border rounded text-center text-sm"
                                                value={editForm.theory}
                                                onChange={e => setEditForm({ ...editForm, theory: parseFloat(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <input
                                                type="number"
                                                className="w-16 p-1 border rounded text-center text-sm"
                                                value={editForm.skua}
                                                onChange={e => setEditForm({ ...editForm, skua: parseFloat(e.target.value) })}
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <input
                                                type="number"
                                                className="w-16 p-1 border rounded text-center text-sm"
                                                value={editForm.achievement}
                                                onChange={e => setEditForm({ ...editForm, achievement: parseFloat(e.target.value) })}
                                            />
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">{student.grades?.nilaiUjianTeori || 0}</td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">{student.grades?.nilaiUjianSKUA || 0}</td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-400">+{student.grades?.nilaiPrestasi || 0}</td>
                                    </>
                                )}

                                <td className="p-4 text-center font-black text-lg text-primary">
                                    {student.grades?.finalScore || 0}
                                </td>

                                <td className="p-4 text-center">
                                    {editingId === student.id ? (
                                        <select
                                            className="text-xs p-1 border rounded"
                                            value={student.statusKelulusan}
                                            onChange={async (e) => {
                                                const newStatus = e.target.value as any;
                                                const res = await updateAdmissionStatus(student.id, newStatus);
                                                if (res.success) {
                                                    toast.success("Status diperbarui");
                                                    router.refresh();
                                                }
                                            }}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="LULUS">Lulus</option>
                                            <option value="TIDAK_LULUS">Tidak Lulus</option>
                                        </select>
                                    ) : (
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${student.statusKelulusan === "LULUS" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                student.statusKelulusan === "TIDAK_LULUS" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                            }`}>
                                            {student.statusKelulusan}
                                        </span>
                                    )}
                                </td>

                                <td className="p-4 text-center">
                                    {editingId === student.id ? (
                                        <div className="flex justify-center gap-1">
                                            <button
                                                onClick={handleSave}
                                                disabled={loading}
                                                className="p-1 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                                            >
                                                <span className="material-symbols-outlined text-sm">check</span>
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                            >
                                                <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                                            title="Input Nilai Tes"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">edit_square</span>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
