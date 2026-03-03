"use client";

import { useState } from "react";
import { sendManualWA } from "@/app/actions/notifications";
import { toast } from "react-hot-toast";

interface ContactWAButtonProps {
    studentId: string;
    studentName: string;
    phoneNumber: string;
}

export default function ContactWAButton({ studentId, studentName, phoneNumber }: ContactWAButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Pesan tidak boleh kosong");
            return;
        }

        setIsLoading(true);
        try {
            const result = await sendManualWA(studentId, message);
            if (result.success) {
                toast.success("Pesan WhatsApp berhasil dikirim!");
                setIsOpen(false);
                setMessage("");
            } else {
                toast.error(result.error || "Gagal mengirim pesan");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    if (!phoneNumber) return null;

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95 translate-y-[-1px]"
            >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Hubungi via WA
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">send_and_archive</span>
                                    Kirim Pesan WhatsApp
                                </h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Pesan akan dikirim ke <strong>{studentName}</strong> ({phoneNumber})
                                </p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                                Pesan Anda
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Halo, mohon segera lengkapi berkas pendaftaran Anda..."
                                className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
                            ></textarea>

                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20 flex gap-3">
                                <span className="material-symbols-outlined text-blue-500 text-[18px]">info</span>
                                <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                                    Pesan ini menggunakan kuota WhatsApp Gateway sekolah. Pastikan saldo/token Anda mencukupi.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={isLoading}
                                className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 active:translate-y-[1px]"
                            >
                                {isLoading ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Kirim Sekarang
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
