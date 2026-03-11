"use client";

import { useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface DownloadPdfButtonProps {
    targetId: string;
    fileName: string;
    label?: string;
}

export default function DownloadPdfButton({ targetId, fileName, label = "Download PDF" }: DownloadPdfButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setLoading(true);
        // Add class for PDF-specific styling
        element.classList.add('is-pdf-exporting');

        try {
            // Using html-to-image which supports modern CSS (oklch, fallback variables) better than html2canvas
            const dataUrl = await toPng(element, {
                quality: 1.0,
                backgroundColor: '#ffffff',
                pixelRatio: 3, // Increased for better clarity
                cacheBust: true,
                skipFonts: false, // Try to include fonts for better look
            });

            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgProps = pdf.getImageProperties(dataUrl);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Use 'FAST' or 'SLOW' to balance speed vs quality
            pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`${fileName}.pdf`);

        } catch (error: any) {
            console.error("Error generating PDF:", error);
            let errorMessage = "Terjadi kesalahan tidak dikenal";

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                // html-to-image often throws Event objects on failure
                errorMessage = `Gagal memuat gambar atau font: ${JSON.stringify(error)}`;
                if (Object.keys(error).length === 0) {
                    errorMessage = "Gagal memuat aset (CORS atau Timeout). Pastikan koneksi internet stabil.";
                }
            } else {
                errorMessage = String(error);
            }

            alert(`Gagal mengunduh PDF: ${errorMessage}`);
        } finally {
            element.classList.remove('is-pdf-exporting');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-2 print:hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
            ) : (
                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            )}
            {label}
        </button>
    );
}
