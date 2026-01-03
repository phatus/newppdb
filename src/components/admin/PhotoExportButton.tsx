"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getAcceptedStudentsForEmis } from "@/app/actions/emis-export";

export default function PhotoExportButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handlePhotoExport = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Memuat data foto...");

        try {
            // 1. Fetch Students
            const res = await getAcceptedStudentsForEmis();
            if (!res.success || !res.data || res.data.length === 0) {
                toast.error("Tidak ada data siswa untuk diexport", { id: toastId });
                return;
            }

            const students = res.data as any[];
            toast.loading(`Menyiapkan ${students.length} foto...`, { id: toastId });

            // 2. Import JSZip
            const JSZip = (await import("jszip")).default;
            const zip = new JSZip();
            let count = 0;

            // 3. Process Photos
            const photoPromises = students.map(async (student) => {
                const photoUrl = student.documents?.pasFoto;
                const nomorUjian = student.nomorUjian;

                if (photoUrl && nomorUjian) {
                    try {
                        const response = await fetch(photoUrl);
                        if (!response.ok) throw new Error("Network response was not ok");
                        const blob = await response.blob();

                        // Add to ZIP: {nomorUjian}.jpg
                        zip.file(`${nomorUjian}.jpg`, blob);
                        count++;
                    } catch (err) {
                        console.error(`Failed to fetch photo for ${student.namaLengkap}:`, err);
                    }
                }
            });

            await Promise.all(photoPromises);

            if (count === 0) {
                toast.error("Tidak ada foto valid yang ditemukan.", { id: toastId });
                return;
            }

            // 4. Generate & Download ZIP
            const content = await zip.generateAsync({ type: "blob" });
            const url = window.URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Foto_Peserta_Ujian_${new Date().getTime()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success(`Berhasil mengunduh ${count} foto`, { id: toastId });

        } catch (error) {
            console.error("Export photo error:", error);
            toast.error("Gagal mengexport foto", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handlePhotoExport}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <span className="material-symbols-outlined">perm_media</span>
            {isLoading ? "Memproses..." : "Download Foto (.zip)"}
        </button>
    );
}
