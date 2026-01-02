"use client";

import { useState } from "react";
import { updateStudentScore } from "@/app/actions/ranking";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

interface StudentProps {
    id: string;
    namaLengkap: string;
    nisn: string;
    jalur: string;
    grades?: {
        nilaiUjianTeori: number | null;
        nilaiUjianSKUA: number | null;
        nilaiPrestasi: number | null;
        rataRataNilai: number | null;
    } | null;
    documents?: {
        filePrestasi: string[];
    } | null;
}

export default function BatchGradeTable({ students }: { students: StudentProps[] }) {
    const [showGuide, setShowGuide] = useState(false);
    const [viewingDocs, setViewingDocs] = useState<{ name: string; files: string[] } | null>(null);
    const [search, setSearch] = useState("");

    const filteredStudents = students.filter(student =>
        student.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
        student.nisn.includes(search)
    );

    const handleExport = () => {
        const dataToExport = filteredStudents.map((student, index) => ({
            "No": index + 1,
            "Nama Lengkap": student.namaLengkap,
            "NISN": student.nisn,
            "Jalur": student.jalur.replace("_", " "),
            "Rata Raport": student.grades?.rataRataNilai || 0,
            "Nilai Teori": student.grades?.nilaiUjianTeori || 0,
            "Nilai SKUA": student.grades?.nilaiUjianSKUA || 0,
            "Nilai Prestasi": student.grades?.nilaiPrestasi || 0,
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Adjust column width
        const wscols = [
            { wch: 5 },  // No
            { wch: 30 }, // Nama
            { wch: 15 }, // NISN
            { wch: 20 }, // Jalur
            { wch: 15 }, // Raport
            { wch: 15 }, // Teori
            { wch: 15 }, // SKUA
            { wch: 15 }, // Prestasi
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Data Nilai Siswa");
        XLSX.writeFile(wb, `Data_Nilai_Siswa_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Berhasil mengexport data nilai!");
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors shadow-sm text-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    Export Excel
                </button>

                <div className="relative w-full max-w-xs">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Cari Nama atau NISN..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm item-center text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-12 text-center">No</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Nama Siswa</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-32">Rata Raport</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-32">Teori (0-100)</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-32">SKUA (0-100)</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-32">
                                    <div className="flex items-center gap-1 group relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setShowGuide(true)}>
                                        <span>Prestasi</span>
                                        <span className="material-symbols-outlined text-[18px] text-primary">info</span>
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300 w-32 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <GradeRow
                                        key={student.id}
                                        student={student}
                                        index={index}
                                        onViewDocs={(files) => setViewingDocs({ name: student.namaLengkap, files })}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-8 text-slate-500 italic bg-white dark:bg-slate-800">
                                        Tidak ada siswa yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Document Viewer Modal */}
            {viewingDocs && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">description</span>
                                Dokumen Prestasi
                            </h3>
                            <button onClick={() => setViewingDocs(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-slate-500 mb-4">Dokumen prestasi milik <b>{viewingDocs.name}</b>:</p>
                            {viewingDocs.files.length > 0 ? (
                                <div className="space-y-2">
                                    {viewingDocs.files.map((file, idx) => (
                                        <a
                                            key={idx}
                                            href={file}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 group"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate group-hover:text-primary transition-colors">
                                                    Dokumen Prestasi {idx + 1}
                                                </p>
                                                <p className="text-xs text-slate-400">Klik untuk melihat</p>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">open_in_new</span>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-slate-500 italic py-4">Tidak ada dokumen yang diunggah.</p>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setViewingDocs(null)}
                                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guide Modal Overlay */}
            {showGuide && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">emoji_events</span>
                                Panduan Poin Prestasi
                            </h3>
                            <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-slate-500">close</span>
                            </button>
                        </div>

                        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed flex gap-2">
                                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">info</span>
                                    <span>Gunakan panduan ini untuk menentukan poin prestasi siswa. Poin ini akan ditambahkan ke hitungan ranking akhir.</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
                                        Kemdikbud / Kemenag
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Nasional</span>
                                            <b className="text-primary">50</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Provinsi</span>
                                            <b className="text-primary">25</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Kabupaten</span>
                                            <b className="text-primary">10</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Kecamatan</span>
                                            <b className="text-primary">5</b>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
                                        Umum / Swasta / Organisasi
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Nasional</span>
                                            <b className="text-orange-500">30</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Provinsi</span>
                                            <b className="text-orange-500">15</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Kabupaten</span>
                                            <b className="text-orange-500">5</b>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-slate-50 dark:bg-slate-700/50 rounded border border-slate-200 dark:border-slate-700">
                                            <span className="text-slate-600 dark:text-slate-400">Kecamatan</span>
                                            <b className="text-orange-500">2</b>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">
                                        Tahfidz Quran
                                    </p>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 flex items-center justify-between">
                                        <span className="text-green-800 dark:text-green-300 font-medium text-sm">Per Juz (Hafalan Mutqin)</span>
                                        <span className="bg-white dark:bg-slate-800 text-green-700 dark:text-green-400 px-3 py-1 rounded-lg border border-green-200 dark:border-green-800 font-bold shadow-sm text-sm">
                                            +5 Poin
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                            <button
                                onClick={() => setShowGuide(false)}
                                className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-colors shadow-sm text-sm"
                            >
                                Tutup Panduan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function GradeRow({ student, index, onViewDocs }: { student: StudentProps; index: number; onViewDocs: (files: string[]) => void }) {
    const isPrestasi = student.jalur !== "REGULER"; // Assuming "PRESTASI_AKADEMIK" or "PRESTASI_NON_AKADEMIK"
    const hasDocuments = student.documents?.filePrestasi && student.documents.filePrestasi.length > 0;
    const [teori, setTeori] = useState(student.grades?.nilaiUjianTeori?.toString() || "");
    const [skua, setSkua] = useState(student.grades?.nilaiUjianSKUA?.toString() || "");
    const [prestasi, setPrestasi] = useState(student.grades?.nilaiPrestasi?.toString() || "");
    const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    const handleSave = async () => {
        const valTeori = parseFloat(teori);
        const valSkua = parseFloat(skua);
        const valPrestasi = parseFloat(prestasi);

        setStatus("saving");
        const res = await updateStudentScore(student.id, {
            theory: isNaN(valTeori) ? undefined : valTeori,
            skua: isNaN(valSkua) ? undefined : valSkua,
            achievement: isPrestasi ? (isNaN(valPrestasi) ? undefined : valPrestasi) : undefined
        });

        if (res.success) {
            setStatus("saved");
            setTimeout(() => setStatus("idle"), 2000);
        } else {
            setStatus("error");
            toast.error(`Gagal menyimpan ${student.namaLengkap}`);
        }
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td className="px-6 py-3 text-center text-slate-500">{index + 1}</td>
            <td className="px-6 py-3">
                <div className="flex flex-col">
                    <p className="font-bold text-slate-900 dark:text-white">{student.namaLengkap}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 font-mono">{student.nisn}</span>
                        {isPrestasi && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                PRESTASI
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-3">
                <div className="w-full px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 rounded-md border border-transparent font-medium text-slate-700 dark:text-slate-300">
                    {student.grades?.rataRataNilai?.toFixed(2) || "-"}
                </div>
            </td>
            <td className="px-6 py-3">
                <input
                    type="number"
                    value={teori}
                    onChange={(e) => setTeori(e.target.value)}
                    onBlur={handleSave}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="0"
                    min="0"
                    max="100"
                />
            </td>
            <td className="px-6 py-3">
                <input
                    type="number"
                    value={skua}
                    onChange={(e) => setSkua(e.target.value)}
                    onBlur={handleSave}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="0"
                    min="0"
                    max="100"
                />
            </td>
            <td className="px-6 py-3">
                {isPrestasi ? (
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            value={prestasi}
                            onChange={(e) => setPrestasi(e.target.value)}
                            onBlur={handleSave}
                            className="w-20 rounded-md border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="0"
                            min="0"
                        />
                        {hasDocuments && (
                            <button
                                onClick={() => onViewDocs(student.documents!.filePrestasi)}
                                className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-200"
                                title="Lihat Dokumen Prestasi"
                            >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                        )}
                        {!hasDocuments && (
                            <span className="material-symbols-outlined text-[18px] text-slate-300 cursor-not-allowed" title="Tidak ada dokumen">visibility_off</span>
                        )}
                    </div>
                ) : (
                    <div className="w-full px-3 py-1.5 text-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-md select-none border border-transparent" title="Hanya untuk jalur prestasi">
                        -
                    </div>
                )}
            </td>
            <td className="px-6 py-3 text-center">
                {status === "saving" && <span className="material-symbols-outlined animate-spin text-slate-400 text-lg">sync</span>}
                {status === "saved" && <span className="material-symbols-outlined text-green-500 text-lg animate-in zoom-in">check_circle</span>}
                {status === "error" && <span className="material-symbols-outlined text-red-500 text-lg">error</span>}
                {status === "idle" && <span className="block w-4 h-4"></span>}
            </td>
        </tr>
    );
}
