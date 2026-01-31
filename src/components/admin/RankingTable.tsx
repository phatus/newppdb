"use client";

import { useState } from "react";
import { updateStudentScore, autoSelectStudents } from "@/app/actions/ranking";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { updateAdmissionStatus } from "@/app/actions/verification";
import Swal from "sweetalert2";
import RankingExportButton from "./RankingExportButton";

export default function RankingTable({ initialData, waves }: { initialData: any[]; waves: any[] }) {
    const router = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({
        theory: 0,
        skua: 0,
        achievement: 0
    });
    const [loading, setLoading] = useState(false);

    // Filters
    const [waveFilter, setWaveFilter] = useState<string>("all");
    const [jalurFilter, setJalurFilter] = useState<string>("all");

    // Client-side filtering
    const filteredData = initialData.filter(student => {
        const matchesWave = waveFilter === "all" || student.waveId === waveFilter;
        const matchesJalur = jalurFilter === "all" || student.jalur === jalurFilter;
        return matchesWave && matchesJalur;
    });

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

    const handleGenerate = async () => {
        const result = await Swal.fire({
            title: 'Generate Seleksi?',
            text: "Sistem akan otomatis menentukan penerimaan berdasarkan kuota dan ranking skor akhir. Data yang ada akan ditimpa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Generate!',
            cancelButtonText: 'Batal'
        });

        if (result.isConfirmed) {
            const toastId = toast.loading("Sedang memproses seleksi otomatis...");
            try {
                // Pass filters to the action
                const filters: any = {};
                if (waveFilter !== "all") filters.waveId = waveFilter;
                if (jalurFilter !== "all") filters.jalur = jalurFilter;

                const res = await autoSelectStudents(filters);
                if (res.success) {
                    toast.success(res.message || "Seleksi selesai", { id: toastId });
                    router.refresh();
                } else {
                    toast.error(res.error || "Gagal melakukan seleksi", { id: toastId });
                }
            } catch (error) {
                console.error(error);
                toast.error("Terjadi kesalahan sistem", { id: toastId });
            }
        }
    };

    return (
        <div>
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gelombang:</span>
                        <select
                            value={waveFilter}
                            onChange={(e) => setWaveFilter(e.target.value)}
                            className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-primary/20"
                        >
                            <option value="all">Semua Gelombang</option>
                            {waves.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jalur:</span>
                        <select
                            value={jalurFilter}
                            onChange={(e) => setJalurFilter(e.target.value)}
                            className="text-sm border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-primary/20"
                        >
                            <option value="all">Semua Jalur</option>
                            <option value="REGULER">Reguler</option>
                            <option value="AFIRMASI">Afirmasi</option>
                            <option value="PRESTASI_AKADEMIK">Prestasi Akademik</option>
                            <option value="PRESTASI_NON_AKADEMIK">Prestasi Non-Akademik</option>
                        </select>
                    </div>
                    <div className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 font-medium">
                        Total: {filteredData.length} Murid
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <RankingExportButton data={filteredData} />
                    <button
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                        Generate Seleksi
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-4 w-16 text-center">#</th>
                            <th className="p-4">Nama Murid</th>
                            <th className="p-4">Asal Sekolah</th>
                            <th className="p-4">Jalur</th>
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
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="p-8 text-center text-slate-500">Tidak ada murid yang sesuai dengan filter.</td>
                            </tr>
                        ) : (
                            filteredData.map((student, idx) => {
                                const isRegulerLike = student.jalur === "REGULER" || student.jalur === "AFIRMASI";
                                const isNoRaporPath = isRegulerLike || student.jalur === "PRESTASI_NON_AKADEMIK";

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 text-center font-bold text-slate-400">{idx + 1}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-slate-900 dark:text-white">{student.namaLengkap}</div>
                                            <div className="text-xs text-slate-500">{student.nisn}</div>
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300 text-sm">{student.asalSekolah}</td>
                                        <td className="p-4 text-sm font-medium">
                                            <span className={`px-2 py-1 rounded text-xs ${student.jalur?.includes('PRESTASI') ? 'bg-amber-100 text-amber-800' :
                                                student.jalur === 'AFIRMASI' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {student.jalur === 'PRESTASI_AKADEMIK' ? 'Prestasi Akd' :
                                                    student.jalur === 'PRESTASI_NON_AKADEMIK' ? 'Prestasi Non-Akd' :
                                                        student.jalur === 'REGULER' ? 'Reguler' :
                                                            student.jalur === 'AFIRMASI' ? 'Afirmasi' : student.jalur}
                                            </span>
                                        </td>

                                        {/* Rapor Average */}
                                        <td className="p-4 text-center font-mono text-slate-700 dark:text-slate-300">
                                            {isNoRaporPath ? "-" : (student.grades?.rataRataNilai?.toFixed(2) || "-")}
                                        </td>

                                        {/* Theory/Exam Scores (Always visible, but might be 0 weight) */}
                                        {editingId === student.id ? (
                                            <>
                                                <td className="p-2 text-center">
                                                    <input
                                                        type="number"
                                                        className="w-16 p-1 border rounded text-center text-sm"
                                                        value={editForm.theory}
                                                        onChange={e => setEditForm({ ...editForm, theory: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    <input
                                                        type="number"
                                                        className="w-16 p-1 border rounded text-center text-sm"
                                                        value={editForm.skua}
                                                        onChange={e => setEditForm({ ...editForm, skua: parseFloat(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="p-2 text-center">
                                                    {isRegulerLike ? "-" : (
                                                        <input
                                                            type="number"
                                                            className="w-16 p-1 border rounded text-center text-sm"
                                                            value={editForm.achievement}
                                                            onChange={e => setEditForm({ ...editForm, achievement: parseFloat(e.target.value) || 0 })}
                                                        />
                                                    )}
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-4 text-center text-slate-600 dark:text-slate-400">{student.grades?.nilaiUjianTeori || 0}</td>
                                                <td className="p-4 text-center text-slate-600 dark:text-slate-400">{student.grades?.nilaiUjianSKUA || 0}</td>
                                                <td className="p-4 text-center text-slate-600 dark:text-slate-400">
                                                    {isRegulerLike ? "-" : `+${student.grades?.nilaiPrestasi || 0}`}
                                                </td>
                                            </>
                                        )}

                                        <td className="p-4 text-center font-black text-lg text-primary">
                                            {student.grades?.finalScore || 0}
                                        </td>

                                        <td className="p-4 text-center">
                                            <select
                                                value={student.statusKelulusan}
                                                onChange={async (e) => {
                                                    const newStatus = e.target.value;
                                                    const toastId = toast.loading("Memperbarui status...");
                                                    try {
                                                        const res = await updateAdmissionStatus(student.id, newStatus as any);
                                                        if (res.success) {
                                                            toast.success("Status berhasil diperbarui", { id: toastId });
                                                            router.refresh();
                                                        } else {
                                                            toast.error(res.error || "Gagal memperbarui status", { id: toastId });
                                                        }
                                                    } catch (error) {
                                                        toast.error("Terjadi kesalahan sistem", { id: toastId });
                                                    }
                                                }}
                                                className={`text-[10px] font-bold px-2 py-1 rounded-full border-none outline-none cursor-pointer appearance-none text-center ${student.statusKelulusan === "LULUS" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                    student.statusKelulusan === "TIDAK_LULUS" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                                    }`}
                                            >
                                                <option value="LULUS">DITERIMA</option>
                                                <option value="TIDAK_LULUS">TIDAK DITERIMA</option>
                                                <option value="PENDING">PENDING</option>
                                            </select>
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
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
