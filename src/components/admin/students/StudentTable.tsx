"use client";

import Link from "next/link";
import { useState } from "react";
// import { toast } from "react-hot-toast"; // Keeping generic toast for other potential uses if needed, or remove. 
// Swal handles notifications for delete now.
import Swal from "sweetalert2";
import { deleteStudents, deleteAllStudents } from "@/app/actions/students";

interface StudentTableProps {
    students: any[];
}

export default function StudentTable({ students }: StudentTableProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.length === students.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.map((s) => s.id));
        }
    };

    const toggleSelectOne = (id: string) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleDelete = async (ids: string[]) => {
        const result = await Swal.fire({
            title: 'Apakah Anda yakin?',
            text: `Anda akan menghapus ${ids.length} data murid. Tindakan ini tidak dapat dibatalkan!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        setIsDeleting(true);
        try {
            const res = await deleteStudents(ids);
            if (res.success) {
                Swal.fire(
                    'Terhapus!',
                    'Data murid berhasil dihapus.',
                    'success'
                );
                setSelectedIds([]);
            } else {
                Swal.fire(
                    'Gagal!',
                    res.error || 'Gagal menghapus data.',
                    'error'
                );
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                'Terjadi kesalahan sistem.',
                'error'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteAll = async () => {
        const confirmPhrase = "SAYA YAKIN";

        const result = await Swal.fire({
            title: 'HAPUS SEMUA DATA?',
            html: `Ini adalah tindakan <strong>BERBAHAYA</strong>. Anda akan menghapus <strong>SEMUA ${students.length} data calon murid</strong>.<br/><br/>Ketik <strong>"${confirmPhrase}"</strong> untuk melanjutkan:`,
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off',
                placeholder: confirmPhrase
            },
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hapus Semua',
            cancelButtonText: 'Batal',
            preConfirm: (value) => {
                if (value !== confirmPhrase) {
                    Swal.showValidationMessage(`Ketik "${confirmPhrase}" dengan benar!`);
                }
            }
        });

        if (!result.isConfirmed) return;

        setIsDeleting(true);
        try {
            const res = await deleteAllStudents();
            if (res.success) {
                Swal.fire(
                    'Reset Berhasil!',
                    'Semua data murid telah dihapus.',
                    'success'
                );
                setSelectedIds([]);
            } else {
                Swal.fire(
                    'Gagal!',
                    res.error || 'Gagal menghapus semua data.',
                    'error'
                );
            }
        } catch (error) {
            Swal.fire(
                'Error!',
                'Terjadi kesalahan sistem.',
                'error'
            );
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">
                        {selectedIds.length} data terpilih
                    </span>
                    <button
                        onClick={() => handleDelete(selectedIds)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Hapus Terpilih
                    </button>
                </div>
            )}

            <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-4 py-4 w-10 text-center">
                                    <input
                                        type="checkbox"
                                        checked={students.length > 0 && selectedIds.length === students.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">No</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">NISN</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Asal Sekolah</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Jalur</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-center">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        Data pendaftar masih kosong.
                                    </td>
                                </tr>
                            ) : (
                                students.map((student, index) => (
                                    <tr key={student.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${selectedIds.includes(student.id) ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}`}>
                                        <td className="px-4 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(student.id)}
                                                onChange={() => toggleSelectOne(student.id)}
                                                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{student.namaLengkap}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">{student.nisn}</td>
                                        <td className="px-6 py-4 text-slate-500">{student.asalSekolah || "-"}</td>
                                        <td className="px-6 py-4 text-slate-500">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${student.jalur === 'PRESTASI_AKADEMIK' ? 'bg-purple-100 text-purple-800' :
                                                    student.jalur === 'PRESTASI_NON_AKADEMIK' ? 'bg-indigo-100 text-indigo-800' :
                                                        'bg-blue-100 text-blue-800'}`}>
                                                {student.jalur ? student.jalur.replace(/_/g, " ") : "REGULER"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${student.statusVerifikasi === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                                                student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${student.statusVerifikasi === 'VERIFIED' ? 'bg-green-600' :
                                                    student.statusVerifikasi === 'REJECTED' ? 'bg-red-600' :
                                                        'bg-yellow-600'
                                                    }`}></span>
                                                {student.statusVerifikasi === 'VERIFIED' ? 'Verified' :
                                                    student.statusVerifikasi === 'REJECTED' ? 'Rejected' :
                                                        'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/verification/${student.id}`} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Verifikasi / Detail">
                                                    <span className="material-symbols-outlined text-[20px]">edit_document</span>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete([student.id])}
                                                    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Delete All */}
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                        Total: <span className="font-bold text-slate-900 dark:text-white">{students.length}</span> Murid
                    </div>

                    {students.length > 0 && (
                        <button
                            onClick={handleDeleteAll}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 opacity-70 hover:opacity-100 transition-all font-medium"
                        >
                            <span className="material-symbols-outlined text-[16px]">dangerous</span>
                            Reset (Hapus Semua Data)
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
