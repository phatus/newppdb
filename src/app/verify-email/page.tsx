"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Memverifikasi email Anda...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Token verifikasi invalid atau tidak ditemukan.");
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/verify-email?token=${token}`);
                const data = await res.json();

                if (res.ok) {
                    setStatus("success");
                    setMessage("Email berhasil diverifikasi! Anda sekarang dapat masuk.");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Gagal memverifikasi email.");
                }
            } catch (error) {
                setStatus("error");
                setMessage("Terjadi kesalahan jaringan.");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-100 dark:border-slate-700">
                <div className="mb-6 flex justify-center">
                    {status === "loading" && (
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                    )}
                    {status === "success" && (
                        <span className="material-symbols-outlined text-green-500 text-6xl">
                            check_circle
                        </span>
                    )}
                    {status === "error" && (
                        <span className="material-symbols-outlined text-red-500 text-6xl">
                            error
                        </span>
                    )}
                </div>

                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {status === "loading" && "Verifikasi Email"}
                    {status === "success" && "Verifikasi Berhasil"}
                    {status === "error" && "Verifikasi Gagal"}
                </h1>

                <p className="text-slate-600 dark:text-slate-300 mb-8">
                    {message}
                </p>

                {status === "success" && (
                    <Link
                        href="/auth/login"
                        className="inline-flex w-full justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all"
                    >
                        Masuk ke Aplikasi
                    </Link>
                )}

                {status === "error" && (
                    <Link
                        href="/auth/login"
                        className="inline-flex w-full justify-center rounded-lg bg-slate-100 dark:bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-900 dark:text-white shadow-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    >
                        Kembali ke Halaman Login
                    </Link>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
