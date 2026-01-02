"use client";

import { useEffect } from "react";

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string | null;
    title: string;
}

export default function DocumentPreviewModal({ isOpen, onClose, url, title }: DocumentPreviewModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !url) return null;

    const isPdf = url.toLowerCase().endsWith(".pdf") || url.startsWith("blob:"); // Basic check, ideally rely on MIME type if available

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">visibility</span>
                        Preview: {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500 hover:text-red-500"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 flex items-center justify-center overflow-auto relative">
                    {isPdf ? (
                        <iframe
                            src={`${url}#toolbar=0`}
                            className="w-full h-full rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 bg-white"
                            title={title}
                        />
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={url}
                            alt={title}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-3">
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                        Buka di Tab Baru
                    </a>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity text-sm font-bold"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
