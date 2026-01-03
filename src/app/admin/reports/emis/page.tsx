"use client";

import { useEffect, useState } from "react";
import { getAcceptedStudentsForEmis } from "@/app/actions/emis-export";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function EmisExportPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await getAcceptedStudentsForEmis();
            if (res.success && res.data) {
                setStudents(res.data);
            } else {
                toast.error(res.error || "Gagal memuat data");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        if (students.length === 0) {
            toast.error("Tidak ada data untuk diexport");
            return;
        }

        const exportData = students.map((s, index) => ({
            "No": index + 1,
            "Nama Lengkap": s.namaLengkap,
            "NISN": s.nisn,
            "NIK": s.nik || "-",
            "No KK": s.noKk || "-",
            "Jenis Kelamin": s.gender || "-",
            "Tempat Lahir": s.tempatLahir || "-",
            "Tanggal Lahir": s.tanggalLahir ? new Date(s.tanggalLahir).toLocaleDateString("id-ID") : "-",
            "Asal Sekolah": s.asalSekolah || "-",
            "Nama Ayah": s.namaAyah || "-",
            "Pekerjaan Ayah": s.pekerjaanAyah || "-",
            "Nama Ibu": s.namaIbu || "-",
            "Pekerjaan Ibu": s.pekerjaanIbu || "-",
            "Penghasilan Ortu": s.penghasilanOrtu || "-",
            "Alamat Jalan": s.alamatJalan || "-",
            "RT": s.alamatRt || "-",
            "RW": s.alamatRw || "-",
            "Desa/Kelurahan": s.alamatDesa || "-",
            "Kecamatan": s.alamatKecamatan || "-",
            "Kabupaten/Kota": s.alamatKabupaten || "-",
            "Provinsi": s.alamatProvinsi || "-",
            "Kode Pos": s.kodePos || "-",
            "Telepon": s.telepon || "-",
            "Jalur Pendaftaran": s.jalur
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data EMIS");
        XLSX.writeFile(wb, `Data_Siswa_EMIS_${new Date().getTime()}.xlsx`);
    };



    if (isLoading) {
        return <div className="p-8 text-center">Memuat data...</div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Export Data EMIS</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Unduh data siswa yang diterima untuk keperluan integrasi EMIS.
                    </p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors"
                >
                    <span className="material-symbols-outlined">file_download</span>
                    Export Excel (.xlsx)
                </button>

            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 w-12 text-center">No</th>
                                <th className="px-6 py-4">Nama Lengkap</th>
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">NIK</th>
                                <th className="px-6 py-4">Asal Sekolah</th>
                                <th className="px-6 py-4">Nama Ayah</th>
                                <th className="px-6 py-4">Nama Ibu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {students.length > 0 ? (
                                students.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-center text-slate-500">{index + 1}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                            {student.namaLengkap}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                            {student.nisn}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono">
                                            {student.nik || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {student.asalSekolah || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {student.namaAyah || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                            {student.namaIbu || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="material-symbols-outlined text-4xl text-slate-300">inbox</span>
                                            <p>Belum ada data siswa yang diterima / terverifikasi.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 flex justify-between items-center">
                    <span>Total: <b>{students.length}</b> siswa</span>
                </div>
            </div>
        </div>
    );
}
