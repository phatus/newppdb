"use client";

import { useState } from "react";
import { deleteJuknis } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

interface JuknisSettingsProps {
    initialData: any;
}

export default function JuknisSettings({ initialData }: JuknisSettingsProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const [currentFile, setCurrentFile] = useState<string | null>(initialData?.juknisFile || null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];

        // Client-side validation
        if (file.type !== "application/pdf") {
            toast.error("Hanya file PDF yang diperbolehkan");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 10MB");
            return;
        }

        const formData = new FormData();
        formData.append("juknis", file);

        setUploading(true);
        setProgress(0);

        try {
            const xhr = new XMLHttpRequest();

            // Setup listeners
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const percentComplete = Math.round((event.loaded / event.total) * 100);
                    setProgress(percentComplete);
                }
            });

            const uploadPromise = new Promise<{ success: boolean; url?: string; message?: string }>((resolve, reject) => {
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                resolve(JSON.parse(xhr.responseText));
                            } catch (e) {
                                resolve({ success: true });
                            }
                        } else {
                            try {
                                const err = JSON.parse(xhr.responseText);
                                reject(new Error(err.message || "Gagal upload"));
                            } catch (e) {
                                reject(new Error("Gagal upload (Server Error)"));
                            }
                        }
                    }
                };
                xhr.onerror = () => reject(new Error("Network Error saat upload"));
            });

            xhr.open("POST", "/api/admin/settings/juknis", true);
            xhr.send(formData);

            const res = await uploadPromise;

            if (res.success) {
                toast.success("File juknis berhasil diupload");
                setCurrentFile(res.url || null);
            } else {
                toast.error("Gagal mengupload file juknis");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Terjadi kesalahan saat upload");
        } finally {
            setUploading(false);
            setProgress(0);
            e.target.value = "";
        }
    };

    const handleDelete = async () => {
        if (!confirm("Yakin ingin menghapus file juknis?")) return;

        setDeleting(true);
        const res = await deleteJuknis();

        if (res.success) {
            toast.success("File juknis berhasil dihapus");
            setCurrentFile(null);
        } else {
            toast.error(res.error || "Gagal menghapus file juknis");
        }
        setDeleting(false);
    };

    return (
        <div className="flex flex-col gap-4 max-w-xl">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Upload file Petunjuk Teknis (Juknis) PMBM dalam format PDF. File ini akan ditampilkan di halaman utama dan dapat diunduh oleh calon peserta didik.
            </p>

            {/* Current File Status */}
            {currentFile ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-red-600 dark:text-red-400">picture_as_pdf</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">File Juknis Aktif</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentFile}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <a
                                    href={currentFile}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium text-primary hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    Lihat PDF
                                </a>
                                <button
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-700 border border-red-200 dark:border-red-800 rounded text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    {deleting ? (
                                        <>
                                            <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></span>
                                            Menghapus...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                            Hapus
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">upload_file</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada file juknis yang diupload</p>
                </div>
            )}

            {/* Progress Bar */}
            {uploading && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Mengupload...</span>
                        <span className="text-primary font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center gap-3">
                <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm cursor-pointer transition-colors ${uploading
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 text-white"
                    }`}>
                    {uploading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Proses Upload...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-lg">cloud_upload</span>
                            {currentFile ? "Ganti File Juknis" : "Upload File Juknis"}
                        </>
                    )}
                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                </label>
                <span className="text-xs text-slate-400">Format: PDF (Maks. 10MB)</span>
            </div>
        </div>
    );
}
