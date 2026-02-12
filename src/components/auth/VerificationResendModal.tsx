"use client";

import { useState, useEffect } from "react";
import { resendVerificationEmail } from "@/app/actions/auth";
import { toast } from "react-hot-toast";

interface VerificationResendModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
}

export default function VerificationResendModal({ isOpen, onClose, email }: VerificationResendModalProps) {
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = async () => {
        if (countdown > 0 || isResending) return;

        setIsResending(true);
        const loadingToast = toast.loading("Mengirim ulang email verifikasi...");

        try {
            const res = await resendVerificationEmail(email);
            toast.dismiss(loadingToast);

            if (res.success) {
                toast.success(res.message || "Email berhasil dikirim ulang. Silakan cek inbox/spam Anda.");
                setCountdown(60); // 60 seconds cooldown
            } else {
                toast.error(res.error || "Gagal mengirim ulang email.");
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan teknis. Coba lagi nanti.");
        } finally {
            setIsResending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1A2632] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="relative h-32 bg-primary/10 flex items-center justify-center overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="relative z-10 size-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-4xl">
                            mark_email_unread
                        </span>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -bottom-6 -left-6 size-24 bg-primary/20 rounded-full blur-2xl"></div>
                    <div className="absolute -top-6 -right-6 size-24 bg-primary/20 rounded-full blur-2xl"></div>
                </div>

                {/* Content */}
                <div className="p-8 text-center">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Email Belum Diverifikasi
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                        Akun Anda dengan email <span className="font-bold text-slate-900 dark:text-white">{email}</span> sudah terdaftar, namun Anda perlu melakukan verifikasi email terlebih dahulu sebelum dapat masuk.
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={handleResend}
                            disabled={countdown > 0 || isResending}
                            className={`flex items-center justify-center gap-2 w-full h-12 rounded-xl font-bold text-base transition-all shadow-md active:scale-95 ${countdown > 0 || isResending
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                }`}
                        >
                            {isResending ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Mengirim...
                                </>
                            ) : countdown > 0 ? (
                                <>
                                    <span className="material-symbols-outlined text-xl">history</span>
                                    Kirim ulang dalam {countdown}s
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-xl">send</span>
                                    Kirim Ulang Link Verifikasi
                                </>
                            )}
                        </button>

                        <button
                            onClick={onClose}
                            className="h-12 w-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white font-semibold transition-colors"
                        >
                            Tutup
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-xs">info</span>
                            Lupa password? Silakan gunakan fitur Lupa Password di halaman login.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
