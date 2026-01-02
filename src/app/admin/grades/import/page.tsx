"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { importCBTGrades } from "@/app/actions/import-grades";
import toast from "react-hot-toast";

export default function ImportGradesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseExcel(selectedFile);
        }
    };

    const parseExcel = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // Get raw JSON
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Header: 1 gives array of arrays

            // Manual parsing based on user image structure
            // Row 10 is usually header "No Ujian | Nama | Hasil Akhir ..."
            // We need to find the header row first.

            let headerRowIndex = -1;
            const rows: any[] = [];

            for (let i = 0; i < jsonData.length; i++) {
                const row: any = jsonData[i];
                // Check for keys we need
                if (row.includes("No Ujian") && row.includes("Nama")) {
                    headerRowIndex = i;
                    continue;
                }

                if (headerRowIndex !== -1) {
                    // This is a data row
                    // Map generic index based on observation of screenshot:
                    // Col 0: No, Col 1: No Ujian, Col 2: Nama, Col 3: Hasil Akhir
                    // But array might strip empty leading cols.
                    // Let's use the header row to find indices.

                    const headers: any = jsonData[headerRowIndex];
                    const idxNoUjian = headers.indexOf("No Ujian");
                    const idxNama = headers.indexOf("Nama");
                    const idxScore = headers.indexOf("Hasil Akhir");

                    if (idxNoUjian > -1 && idxNama > -1 && idxScore > -1) {
                        const noUjian = row[idxNoUjian];
                        const nama = row[idxNama];
                        const score = row[idxScore];

                        if (noUjian && nama) {
                            rows.push({
                                nomorUjian: noUjian,
                                nama: nama,
                                score: score
                            });
                        }
                    }
                }
            }

            setPreviewData(rows);
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;
        setLoading(true);
        try {
            const res = await importCBTGrades(previewData);
            if (res.success) {
                setResult(res);
                toast.success(`Berhasil mengimpor ${res.successCount} nilai siswa.`);
            } else {
                toast.error("Gagal mengimpor data");
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Import Nilai Ujian CBT</h1>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-400 mb-4">upload_file</span>
                <p className="text-slate-500 mb-4">Upload file Excel (.xlsx) hasil export CBT</p>
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                />
            </div>

            {previewData.length > 0 && (
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">Preview Data ({previewData.length} baris)</h3>
                        <button
                            onClick={handleImport}
                            disabled={loading || !!result}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Jalankan Import"}
                        </button>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden max-h-[500px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900 sticky top-0">
                                <tr>
                                    <th className="p-3 font-semibold">No Ujian</th>
                                    <th className="p-3 font-semibold">Nama Siswa</th>
                                    <th className="p-3 font-semibold">Nilai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {previewData.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="p-3 font-mono text-slate-500">{row.nomorUjian}</td>
                                        <td className="p-3 font-medium">{row.nama}</td>
                                        <td className="p-3 font-bold text-primary">{row.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {result && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <h3 className="font-bold text-lg mb-2 text-blue-800 dark:text-blue-300">Hasil Import</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                            <p className="text-3xl font-black text-green-500">{result.successCount}</p>
                            <p className="text-xs font-bold uppercase text-slate-500">Berhasil</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                            <p className="text-3xl font-black text-red-500">{result.failCount}</p>
                            <p className="text-xs font-bold uppercase text-slate-500">Gagal (Siswa Tidak Ditemukan)</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
