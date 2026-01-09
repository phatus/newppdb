"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
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
        try {
            // 1. Pre-process images: Convert all images to Base64 to bypass CORS issues
            const images = element.querySelectorAll('img');
            const originalSrcs: string[] = [];

            await Promise.all(Array.from(images).map(async (img, index) => {
                originalSrcs[index] = img.src;
                try {
                    const response = await fetch(img.src, { mode: 'cors' });
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result as string;
                            resolve(null);
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    console.warn(`Failed to convert image ${img.src} to base64`, e);
                    // Keep original src if failed, hope html2canvas handles it or ignores it
                }
            }));

            // 2. Generate Canvas
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true, // Try to allow tainted images if CORS fails
                logging: false,
                backgroundColor: "#ffffff"
            });

            // 3. Restore original image sources
            images.forEach((img, index) => {
                if (originalSrcs[index]) img.src = originalSrcs[index];
            });

            const imgData = canvas.toDataURL("image/png");

            // Calculate dimensions to fit A4 paper
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save(`${fileName}.pdf`);

        } catch (error: any) {
            console.error("Error generating PDF:", error);
            alert(`Gagal mengunduh PDF (v2): ${error.message || error}`);
        } finally {
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
