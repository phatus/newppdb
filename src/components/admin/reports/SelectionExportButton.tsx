"use client";

import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface SelectionExportButtonProps {
    students: any[];
    filename?: string;
}

export default function SelectionExportButton({ students, filename }: SelectionExportButtonProps) {

    const handleExport = () => {
        if (!students || students.length === 0) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        const dataToExport = students.map((student, index) => ({
            "No": index + 1,
            "Nama Lengkap": student.namaLengkap,
            "NISN": student.nisn,
            "Jalur": student.jalur?.replace(/_/g, " ") || "-",
            "Asal Sekolah": student.asalSekolah || "-",
            "Skor Akhir": student.grades?.finalScore?.toFixed(2) || "0.00",
            "Status": student.statusKelulusan === "LULUS" ? "DITERIMA" :
                student.statusKelulusan === "TIDAK_LULUS" ? "TIDAK DITERIMA" :
                    student.statusKelulusan || "PENDING",
            "Catatan": student.catatanPenolakan || "-"
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Auto width
        const wscols = [
            { wch: 5 },  // No
            { wch: 35 }, // Nama
            { wch: 15 }, // NISN
            { wch: 20 }, // Jalur
            { wch: 25 }, // Asal Sekolah
            { wch: 12 }, // Skor
            { wch: 15 }, // Status
            { wch: 40 }, // Catatan
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Rekap Seleksi");
        const defaultFilename = `Rekap_Seleksi_PMBM_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, filename || defaultFilename);
        toast.success("Rekap Seleksi berhasil diekspor");
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Excel
        </button>
    );
}
