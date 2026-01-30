"use client";

import { useState, useTransition } from "react";
import DocumentItem from "./DocumentItem";
import DocumentPreviewModal from "./DocumentPreviewModal";
import VerificationActionModal from "./VerificationActionModal";
import { verifyStudent, rejectStudent } from "@/app/actions/verification";
import { toast } from "react-hot-toast";

interface DocumentListProps {
    student: any;
    docList: { key: string; label: string; icon: string }[];
    studentId: string;
}

export default function DocumentList({ student, docList, studentId }: DocumentListProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState("");
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Action Modal State
    const [actionModal, setActionModal] = useState<{
        isOpen: boolean;
        type: "VERIFY" | "REJECT" | null;
    }>({ isOpen: false, type: null });

    // Transitions
    const [isPending, startTransition] = useTransition();

    const handlePreview = (url: string, title: string) => {
        setPreviewUrl(url);
        setPreviewTitle(title);
        setIsPreviewOpen(true);
    };

    const handleActionClick = (type: "VERIFY" | "REJECT") => {
        setActionModal({ isOpen: true, type });
    };

    const handleConfirmAction = (note?: string) => {
        const type = actionModal.type;
        if (!type) return;

        startTransition(async () => {
            let result;

            if (type === "VERIFY") {
                result = await verifyStudent(studentId);
            } else {
                result = await rejectStudent(studentId, note || "");
            }

            setActionModal({ isOpen: false, type: null });

            if (result.success) {
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <span className={`material-symbols-outlined text-3xl ${type === 'VERIFY' ? 'text-green-500' : 'text-red-500'}`}>
                                        {type === 'VERIFY' ? 'check_circle' : 'cancel'}
                                    </span>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                                        {type === 'VERIFY' ? 'Verifikasi Berhasil!' : 'Murid Ditolak'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {type === 'VERIFY'
                                            ? 'Status murid telah diperbarui menjadi Terverifikasi.'
                                            : 'Notifikasi penolakan telah dikirim ke murid.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-gray-200 dark:border-slate-700">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-blue-700 focus:outline-none"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                ), { duration: 4000 });
            } else {
                toast.error(result.error || "Terjadi kesalahan", {
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            }
        });
    };

    return (
        <>
            <div className="p-6 space-y-4">
                {docList.map((doc) => {
                    const fileUrl = student.documents ? student.documents[doc.key] : null;

                    // Determine status key
                    let status = "PENDING";
                    if (student.documents) {
                        if (doc.key === 'pasFoto') {
                            status = student.documents.statusPasFoto || "PENDING";
                        } else {
                            const statusKey = doc.key.replace('file', 'status');
                            status = student.documents[statusKey] || "PENDING";
                        }
                    }

                    return (
                        <DocumentItem
                            key={doc.key}
                            docKey={doc.key}
                            label={doc.label}
                            icon={doc.icon}
                            fileUrl={fileUrl}
                            status={status}
                            onPreview={handlePreview}
                            studentId={studentId}
                        />
                    );
                })}

                {/* Actions */}
                <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                    <button
                        onClick={() => handleActionClick("REJECT")}
                        disabled={isPending}
                        className="px-5 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        Tolak dengan Catatan
                    </button>
                    <button
                        onClick={() => handleActionClick("VERIFY")}
                        disabled={isPending}
                        className="px-5 py-2.5 rounded-lg bg-primary hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {isPending ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined text-[20px]">verified</span>
                        )}
                        Verifikasi Semua
                    </button>
                </div>
            </div>

            <DocumentPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                url={previewUrl}
                title={previewTitle}
            />

            <VerificationActionModal
                isOpen={actionModal.isOpen}
                type={actionModal.type}
                onClose={() => setActionModal({ ...actionModal, isOpen: false })}
                onConfirm={handleConfirmAction}
                isLoading={isPending}
            />
        </>
    );
}
