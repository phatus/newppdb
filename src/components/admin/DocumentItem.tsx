"use client";

import { useState, useTransition } from "react";
import { verifyDocument } from "@/app/actions/verification";
import { toast } from "react-hot-toast";
import DocumentUploadButton from "@/components/DocumentUploadButton";

interface DocumentItemProps {
    docKey: string;
    label: string;
    icon: string;
    fileUrl: string | string[] | null;
    status: string; // "PENDING" | "VERIFIED" | "REJECTED" (Mapped from enum)
    onPreview: (url: string, title: string) => void;
    studentId: string;
    isEditing?: boolean;
}

export default function DocumentItem({
    docKey,
    label,
    icon,
    fileUrl,
    status: initialStatus = "PENDING",
    onPreview,
    studentId,
    isEditing = false
}: DocumentItemProps) {
    // Map DB status (VERIFIED/REJECTED) to UI status (VALID/INVALID)
    const normalizedStatus = initialStatus === "VERIFIED" ? "VALID" : initialStatus === "REJECTED" ? "INVALID" : "PENDING";

    const [status, setStatus] = useState<"VALID" | "INVALID" | "PENDING">(normalizedStatus as any);
    const [isPending, startTransition] = useTransition();

    const hasFile = !!fileUrl && (Array.isArray(fileUrl) ? fileUrl.length > 0 : true);
    const files = Array.isArray(fileUrl) ? fileUrl : (fileUrl ? [fileUrl] : []);

    const handleStatusClick = (clickedStatus: "VALID" | "INVALID") => {
        if (!hasFile) return;

        // Toggle logic: if clicking same status, revert to PENDING
        const nextUiStatus = status === clickedStatus ? "PENDING" : clickedStatus;

        // Map back to DB enum
        const dbStatus = nextUiStatus === "VALID" ? "VERIFIED" : nextUiStatus === "INVALID" ? "REJECTED" : "PENDING";

        setStatus(nextUiStatus); // Optimistic update

        startTransition(async () => {
            const result = await verifyDocument(studentId, docKey, dbStatus);
            if (!result.success) {
                toast.error("Gagal menyimpan status dokumen");
                setStatus(status); // Revert on failure
            }
        });
    };

    return (
        <div className="flex flex-col gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${status === 'VALID' ? 'bg-green-100 text-green-600' :
                        status === 'INVALID' ? 'bg-red-100 text-red-600' :
                            'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        }`}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 dark:text-white text-base">{label}</p>

                        {/* Status Badge */}
                        <div className="flex flex-wrap gap-2 mt-1">
                            {status === 'VALID' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 animate-in zoom-in">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span> Valid
                                </span>
                            )}
                            {status === 'INVALID' && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 animate-in zoom-in">
                                    <span className="material-symbols-outlined text-[14px]">cancel</span> Tidak Sesuai
                                </span>
                            )}
                            {status === 'PENDING' && hasFile && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600">
                                    <span className="material-symbols-outlined text-[14px]">schedule</span> Perlu Cek
                                </span>
                            )}
                            {status === 'PENDING' && !hasFile && (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400">
                                    <span className="material-symbols-outlined text-[14px]">remove</span> Kosong
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 items-center">
                    {isEditing && (
                        <DocumentUploadButton
                            studentId={studentId}
                            documentType={docKey as any}
                            label={hasFile ? "Ubah" : "Unggah"}
                        />
                    )}
                    {hasFile && (
                        <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                            <button
                                onClick={() => handleStatusClick("VALID")}
                                title="Tandai Sesuai"
                                className={`p-1.5 rounded transition-all ${status === 'VALID'
                                    ? 'bg-green-500 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-green-600 hover:bg-white dark:hover:bg-slate-600'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                            <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                            <button
                                onClick={() => handleStatusClick("INVALID")}
                                title="Tandai Tidak Sesuai"
                                className={`p-1.5 rounded transition-all ${status === 'INVALID'
                                    ? 'bg-red-500 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-600'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {hasFile && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {files.map((url, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm group">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">attach_file</span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                                    {url.split('/').pop() || `Berkas ${index + 1}`}
                                </span>
                            </div>
                            <button
                                onClick={() => onPreview(url, `${label} - ${index + 1}`)}
                                className="px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-md border border-primary/20 transition-all flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                Lihat
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
