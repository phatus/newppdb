"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { getSettings } from "@/app/actions/settings";
import { resendVerificationEmail } from "@/app/actions/auth";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
    const router = useRouter();
    const [logoUrl, setLogoUrl] = useState("/icons/icon-192x192.png");
    const [schoolName, setSchoolName] = useState("PMBM MTsN 1 Pacitan");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        getSettings().then((settings) => {
            if (settings?.schoolLogo) {
                setLogoUrl(settings.schoolLogo);
            }
            if (settings?.schoolName) {
                setSchoolName(`PMBM ${settings.schoolName}`);
            }
        });
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (resendCountdown > 0) {
            timer = setInterval(() => {
                setResendCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCountdown]);

    const handleResend = async () => {
        if (resendCountdown > 0 || isResending) return;

        setIsResending(true);
        const loadingToast = toast.loading("Mengirim ulang email...");

        try {
            const res = await resendVerificationEmail(email);
            toast.dismiss(loadingToast);

            if (res.success) {
                toast.success(res.message || "Email berhasil dikirim ulang");
                setResendCountdown(60); // 60 seconds cooldown
            } else {
                toast.error(res.error || "Gagal mengirim ulang email");
                // If the error message from server mentions waiting, we could sync the timer
                // but for now, 60s is a good client-side guard.
            }
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error("Terjadi kesalahan teknis. Coba lagi nanti.");
        } finally {
            setIsResending(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Konfirmasi password tidak cocok.");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Terjadi kesalahan saat mendaftar.");
                setIsLoading(false);
                return;
            }

            // Registration successful, show success message
            setSuccess(true);
            setIsLoading(false);

        } catch (err) {
            setError("Terjadi kesalahan sistem. Silakan coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100">
            {/* Top Navbar */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7eef3] dark:border-b-slate-800 bg-white dark:bg-[#1A2632] px-10 py-3 shadow-sm">
                <div className="flex items-center gap-4 text-[#0d151b] dark:text-white">
                    <div className="size-10 flex items-center justify-center rounded overflow-hidden">
                        <img
                            src={logoUrl}
                            alt={`${schoolName} Logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/icons/icon-192x192.png";
                            }}
                        />
                    </div>
                    <h2 className="text-[#0d151b] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        {schoolName}
                    </h2>
                </div>
                <div className="flex flex-1 justify-end gap-8 hidden md:flex">
                    <div className="flex items-center gap-9">
                        <Link
                            href="/"
                            className="text-[#0d151b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        >
                            Beranda
                        </Link>
                        <Link
                            href="#"
                            className="text-[#0d151b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        >
                            Panduan
                        </Link>
                        <Link
                            href="#"
                            className="text-[#0d151b] dark:text-slate-200 text-sm font-medium leading-normal hover:text-primary transition-colors"
                        >
                            Kontak
                        </Link>
                    </div>
                </div>
                {/* Mobile Menu Icon */}
                <div className="flex md:hidden text-[#0d151b] dark:text-white">
                    <span className="material-symbols-outlined cursor-pointer">menu</span>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex items-center justify-center p-4 py-10 sm:px-40">
                <div className="w-full max-w-[480px] bg-white dark:bg-[#1A2632] rounded-xl shadow-lg border border-[#e7eef3] dark:border-slate-700 overflow-hidden">
                    {/* Headline & Intro */}
                    <div className="pt-8 pb-2 px-6 sm:px-8 text-center">
                        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-primary text-2xl">
                                person_add
                            </span>
                        </div>
                        <h2 className="text-[#0d151b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                            Buat Akun Baru
                        </h2>
                        <p className="text-[#4c759a] dark:text-slate-400 text-base font-normal leading-normal pt-2">
                            Lengkapi data untuk memulai pendaftaran PMBM.
                        </p>
                    </div>

                    {success ? (
                        <div className="px-6 pb-8 pt-4 text-center animate-in fade-in zoom-in duration-300">
                            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">
                                    check_circle
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Registrasi Berhasil!</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Sebuah email verifikasi telah dikirim ke <span className="font-bold text-slate-900 dark:text-white">{email}</span>. Silakan cek inbox atau spam Anda untuk mengaktifkan akun.
                            </p>

                            <Link href="/auth/login" className="block w-full">
                                <button className="w-full flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors shadow-sm">
                                    Ke Halaman Login
                                </button>
                            </Link>

                            <div className="mt-6 flex flex-col gap-3">
                                <p className="text-sm text-slate-500">
                                    Belum menerima email?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={resendCountdown > 0 || isResending}
                                    className="text-primary font-bold hover:underline disabled:text-slate-400 disabled:no-underline flex items-center justify-center gap-2"
                                >
                                    {resendCountdown > 0 ? (
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm animate-spin">history</span>
                                            Kirim ulang dalam {resendCountdown}s
                                        </span>
                                    ) : (
                                        "Kirim Ulang Email Verifikasi"
                                    )}
                                </button>
                            </div>

                            <p className="mt-8 text-xs text-slate-400">
                                Sudah verifikasi? Silakan login.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleRegister} className="flex flex-col gap-5 px-6 sm:px-8 pb-8 pt-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    {error}
                                </div>
                            )}

                            {/* Email / WhatsApp Field */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-[#0d151b] dark:text-slate-200 text-sm font-semibold leading-normal"
                                    htmlFor="email"
                                >
                                    Email
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="Contoh: email@contoh.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d151b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdce7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#9cacba] px-4 text-base font-normal leading-normal transition-all"
                                    />
                                </div>
                            </div>



                            {/* Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-[#0d151b] dark:text-slate-200 text-sm font-semibold leading-normal"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <div className="relative flex w-full items-stretch rounded-lg">
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Minimal 8 karakter"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={8}
                                        required
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d151b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdce7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#9cacba] px-4 pr-12 text-base font-normal leading-normal transition-all"
                                    />
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="flex flex-col gap-1.5">
                                <label
                                    className="text-[#0d151b] dark:text-slate-200 text-sm font-semibold leading-normal"
                                    htmlFor="confirmPassword"
                                >
                                    Konfirmasi Password
                                </label>
                                <div className="relative flex w-full items-stretch rounded-lg">
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        placeholder="Masukkan ulang password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        minLength={8}
                                        required
                                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d151b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdce7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#9cacba] px-4 pr-12 text-base font-normal leading-normal transition-all"
                                    />
                                </div>
                            </div>

                            {/* Helper Text */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-3 items-start">
                                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                                    info
                                </span>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Pastikan email aktif untuk menerima notifikasi.
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-600 transition-colors shadow-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="truncate">Memproses...</span>
                                ) : (
                                    <span className="truncate">Daftar Sekarang</span>
                                )}
                            </button>

                            {/* Login Link */}
                            <div className="text-center pt-2">
                                <p className="text-[#4c759a] dark:text-slate-400 text-sm">
                                    Sudah punya akun?{" "}
                                    <Link
                                        href="/auth/login"
                                        className="text-primary font-bold hover:underline hover:text-blue-700 transition-colors"
                                    >
                                        Masuk Disini
                                    </Link>
                                </p>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-6 text-center border-t border-[#e7eef3] dark:border-slate-800 bg-white dark:bg-[#1A2632] mt-auto">
                <p className="text-[#4c759a] dark:text-slate-500 text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0">
                    <span>© 2026 MTsN 1 Pacitan. All rights reserved.</span>
                    <span className="hidden sm:inline mx-2">|</span>
                    <span>Developed by <a href="https://instagram.com/agus_widi90" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-primary transition-colors">aguswidi</a></span>
                </p>
            </footer>
        </div>
    );
}
