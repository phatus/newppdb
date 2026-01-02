"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface DocumentUploadButtonProps {
    studentId: string;
    documentType: "fileAkta" | "fileKK" | "fileSKL" | "fileRaport" | "pasFoto" | "filePrestasi";
    label: string;
    onUploadSuccess?: () => void;
}

export default function DocumentUploadButton({
    studentId,
    documentType,
    label,
    onUploadSuccess
}: DocumentUploadButtonProps) {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type for Raport
        if (documentType === "fileRaport" && file.type !== "application/pdf") {
            toast.error("Format raport harus PDF.");
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran file terlalu besar. Maksimal 2MB.");
            return;
        }

        setIsUploading(true);
        const loadingToast = toast.loading(`Mengunggah ${label}...`);

        try {
            // 1. Upload file itself
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Gagal mengunggah file");

            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;

            // 2. Link file to student record
            const updateRes = await fetch(`/api/students/${studentId}/documents`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    [documentType]: fileUrl,
                }),
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json().catch(() => ({}));
                throw new Error(errorData.message || `Gagal menyimpan data (${updateRes.status})`);
            }

            toast.dismiss(loadingToast);
            toast.success(`Berhasil mengunggah ${label}`);

            router.refresh();
            if (onUploadSuccess) onUploadSuccess();

        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan saat mengunggah dokumen");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    return (
        <label className={`flex w-full md:w-auto cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium leading-normal transition-colors border border-transparent ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <span className="material-symbols-outlined text-[18px]">
                {isUploading ? "progress_activity" : "upload_file"}
            </span>
            <span>{isUploading ? "Mengunggah..." : "Unggah"}</span>
            <input
                type="file"
                className="hidden"
                accept={documentType === "fileRaport" ? ".pdf" : ".pdf,.jpg,.jpeg,.png"}
                onChange={handleFileChange}
                disabled={isUploading}
            />
        </label>
    );
}
