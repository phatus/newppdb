"use client";

import { getCbtExportData } from "@/app/actions/cbt";
import { useState } from "react";
import { toast } from "react-hot-toast";
import * as XLSX from "xlsx";

export default function ExportCbtButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const data = await getCbtExportData();

            if (data.length === 0) {
                toast.error("Tidak ada data murid terverifikasi dengan nomor ujian.");
                setLoading(false);
                return;
            }

            // Create Excel Content based on User Request
            // Columns: Sesi, no_ujian, nama, password, jurusan_kode, agama_kode
            const header = ["Sesi", "no_ujian", "nama", "password", "jurusan_kode", "agama_kode"];

            const rows = data.map(s => [
                "1",                // Sesi
                s.username,         // no_ujian
                s.fullname,         // nama
                s.password,         // password
                "1945",             // jurusan_kode
                "ISLAM"             // agama_kode
            ]);

            // Create Worksheet
            const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);

            // Create Workbook and append sheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Akun CBT");

            // Download File
            XLSX.writeFile(workbook, `akun_cbt_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast.success("Data akun CBT berhasil diexport ke Excel");

        } catch (error) {
            console.error(error);
            toast.error("Gagal export data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Exporting...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Export Akun CBT
                </>
            )}
        </button>
    );
}
