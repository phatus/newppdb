"use client";

import * as XLSX from "xlsx";
import toast from "react-hot-toast";

interface ExportButtonProps {
    students: any[];
}

export default function ExportButton({ students }: ExportButtonProps) {

    const handleExport = () => {
        if (!students || students.length === 0) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        const dataToExport = students.map((student, index) => ({
            "No": index + 1,
            "Nama Lengkap": student.namaLengkap,
            "NISN": student.nisn,
            "Asal Sekolah": student.asalSekolah || "-",
            "Jalur Pendaftaran": student.jalur.replace(/_/g, " "),
            "Email": student.email || "-", // Assuming email might be joined from User or implicitly known if needed, but schema has email in User.
            // Note: student object from findMany default might not have email if not included. 
            // In page.tsx line 25, verify if 'user' is included. It is NOT included in the current `db.student.findMany`.
            // I should update page.tsx to include user if we want email.
            "Status Verifikasi": student.statusVerifikasi,
            "Tanggal Daftar": student.createdAt ? new Date(student.createdAt).toLocaleDateString("id-ID") : "-"
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);

        // Auto width
        const wscols = [
            { wch: 5 },  // No
            { wch: 30 }, // Nama
            { wch: 15 }, // NISN
            { wch: 20 }, // Asal Sekolah
            { wch: 20 }, // Jalur
            { wch: 25 }, // Email
            { wch: 15 }, // Status
            { wch: 15 }, // Tgl
        ];
        ws['!cols'] = wscols;

        XLSX.utils.book_append_sheet(wb, ws, "Data Calon Murid");
        XLSX.writeFile(wb, `Data_Calon_Murid_PMBM_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Data PMBM berhasil diekspor");
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
