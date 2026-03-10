"use client";

import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useState } from "react";
import { getStudentsForExport } from "@/app/actions/students";

interface ExportButtonProps {
    students?: any[];
    filters?: {
        q?: string;
        jalur?: string;
        status?: string;
        waveId?: string;
        dokumen?: string;
    };
}

export default function ExportButton({ students: initialStudents, filters }: ExportButtonProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        let studentsToExport = initialStudents;

        if (filters && !initialStudents) {
            setIsLoading(true);
            try {
                const result = await getStudentsForExport(filters);
                if (result.success && result.students) {
                    studentsToExport = result.students;
                } else {
                    toast.error(result.error || "Gagal mengambil data untuk export");
                    setIsLoading(false);
                    return;
                }
            } catch (error) {
                console.error("Export error:", error);
                toast.error("Terjadi kesalahan saat mengambil data");
                setIsLoading(false);
                return;
            }
            setIsLoading(false);
        }

        if (!studentsToExport || studentsToExport.length === 0) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        const dataToExport = studentsToExport.map((student, index) => ({
            "No": index + 1,
            "Nama Lengkap": student.namaLengkap,
            "NISN": student.nisn,
            "Asal Sekolah": student.asalSekolah || "-",
            "Jalur Pendaftaran": student.jalur.replace(/_/g, " "),
            "Email": student.user?.email || student.email || "-",
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
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
            <span className="material-symbols-outlined text-[18px]">
                {isLoading ? "sync" : "download"}
            </span>
            {isLoading ? "Mengambil Data..." : "Export Excel"}
        </button>
    );
}
