"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function RankingExportButton({ data }: { data: any[] }) {
    const [loading, setLoading] = useState(false);

    const handleExport = () => {
        setLoading(true);
        try {
            // Prepare data for export
            const exportData = data.map((student, index) => ({
                "Ranking": index + 1,
                "Nama Lengkap": student.namaLengkap,
                "NISN": student.nisn,
                "Asal Sekolah": student.asalSekolah || "-",
                "Jalur Pendaftaran": student.jalur === 'PRESTASI_AKADEMIK' ? 'Prestasi Akademik' :
                    student.jalur === 'PRESTASI_NON_AKADEMIK' ? 'Prestasi Non-Akademik' :
                        student.jalur === 'REGULER' ? 'Reguler' :
                            student.jalur === 'AFIRMASI' ? 'Afirmasi' : (student.jalur || "-"),
                "Rapor (Avg)": student.grades?.rataRataNilai || 0,
                "Ujian Teori": student.grades?.nilaiUjianTeori || 0,
                "Ujian SKUA": student.grades?.nilaiUjianSKUA || 0,
                "Poin Prestasi": student.grades?.nilaiPrestasi || 0,
                "Skor Akhir": student.grades?.finalScore || 0,
                "Status Kelulusan": student.statusKelulusan || "PENDING"
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(exportData);

            // Auto-width columns (simple estimation)
            const colWidths = [
                { wch: 8 },  // Ranking
                { wch: 30 }, // Nama
                { wch: 15 }, // NISN
                { wch: 20 }, // Sekolah
                { wch: 20 }, // Jalur
                { wch: 10 }, // Rapor
                { wch: 10 }, // Teori
                { wch: 10 }, // SKUA
                { wch: 10 }, // Prestasi
                { wch: 10 }, // Skor
                { wch: 15 }  // Status
            ];
            ws['!cols'] = colWidths;

            // Create workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Data Perangkingan");

            // Save file
            const fileName = `Export_Perangkingan_PMBM_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success("Data PMBM berhasil diekspor");
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Gagal export data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            title="Download Excel"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
                <span className="material-symbols-outlined text-[20px]">file_download</span>
            )}
            <span className="hidden sm:inline">Export Excel</span>
        </button>
    );
}
