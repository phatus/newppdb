"use client";

import { useState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await forgotPassword(email);
            if (res.success) {
                setSubmitted(true);
                toast.success("Jika email terdaftar, instruksi reset akan dikirim.");
            } else {
                toast.error(res.error || "Terjadi kesalahan.");
            }
        } catch (error) {
            toast.error("Kesalahan koneksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lupa Password?</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Masukkan email Anda untuk menerima tautan reset password.
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Kirim Tautan Reset"}
                        </button>

                        <div className="text-center">
                            <Link href="/auth/login" className="text-sm text-primary hover:underline">
                                Kembali ke Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                            <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">
                            Instruksi untuk mereset password telah dikirim ke <strong>{email}</strong>.
                            Silakan cek inbox (dan folder spam) Anda.
                        </p>
                        <Link
                            href="/auth/login"
                            className="block w-full text-center bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                        >
                            Kembali ke Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
