"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/app/actions/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Token tidak ditemukan.");
            router.push("/auth/login");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Password tidak cocok.");
            return;
        }

        if (password.length < 6) {
            toast.error("Password minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const res = await resetPassword(token!, password);
            if (res.success) {
                toast.success("Password berhasil direset. Silakan login.");
                router.push("/auth/login");
            } else {
                toast.error(res.error || "Gagal mereset password.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Password Baru
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white pr-12 outline-none focus:ring-2 focus:ring-primary"
                            placeholder="••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {showPassword ? "visibility_off" : "visibility"}
                            </span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Konfirmasi Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary"
                        placeholder="••••••••"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
                {loading ? "Menyimpan..." : "Simpan Password Baru"}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Atur Password Baru</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                        Masukkan password baru untuk akun Anda.
                    </p>
                </div>

                <Suspense fallback={<div className="text-center py-4">Memuat...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
