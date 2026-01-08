"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect } from "react";
import { getSettings } from "@/app/actions/settings";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "/dashboard";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                const errorMessage = res.error === "CredentialsSignin"
                    ? "Email atau password salah."
                    : res.error;

                setError(errorMessage);
                setIsLoading(false);
            } else if (res?.ok) {
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                if (session?.user?.role === "ADMIN") {
                    router.push("/admin/dashboard");
                } else {
                    router.push(from);
                }
                router.refresh();
            }
        } catch (err) {
            setError("Terjadi kesalahan. Silakan coba lagi nanti.");
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 sm:px-8 pb-8 pt-4">
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
                    htmlFor="identifier"
                >
                    Email
                </label>
                <div className="relative flex items-center">
                    <input
                        type="email"
                        id="identifier"
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
                <div className="flex justify-between items-center">
                    <label
                        className="text-[#0d151b] dark:text-slate-200 text-sm font-semibold leading-normal"
                        htmlFor="password"
                    >
                        Password
                    </label>
                </div>
                <div className="relative flex w-full items-stretch rounded-lg">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder="Masukkan password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d151b] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/20 border border-[#cfdce7] dark:border-slate-600 bg-slate-50 dark:bg-slate-800 focus:border-primary h-12 placeholder:text-[#9cacba] px-4 pr-12 text-base font-normal leading-normal transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#4c759a] hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </button>
                </div>
                <div className="flex justify-end mt-1">
                    <Link
                        href="/auth/forgot-password"
                        className="text-primary text-sm font-medium hover:underline hover:text-blue-700 transition-colors"
                    >
                        Lupa Password?
                    </Link>
                </div>
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
                    <span className="truncate">Masuk</span>
                )}
            </button>
            {/* Registration Link */}
            <div className="text-center pt-2">
                <p className="text-[#4c759a] dark:text-slate-400 text-sm">
                    Belum punya akun?{" "}
                    <Link
                        href="/auth/register"
                        className="text-primary font-bold hover:underline hover:text-blue-700 transition-colors"
                    >
                        Daftar Sekarang
                    </Link>
                </p>
            </div>
        </form>
    );
}

export default function LoginPage() {
    const [logoUrl, setLogoUrl] = useState("/icons/icon-192x192.png");
    const [schoolName, setSchoolName] = useState("SPMB MTsN 1 Pacitan");

    useEffect(() => {
        getSettings().then((settings) => {
            if (settings?.schoolLogo) {
                setLogoUrl(settings.schoolLogo);
            }
            if (settings?.schoolName) {
                setSchoolName(`SPMB ${settings.schoolName}`);
            }
        });
    }, []);

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
                                lock_open
                            </span>
                        </div>
                        <h2 className="text-[#0d151b] dark:text-white tracking-tight text-[28px] font-bold leading-tight">
                            Masuk Akun Pendaftar
                        </h2>
                        <p className="text-[#4c759a] dark:text-slate-400 text-base font-normal leading-normal pt-2">
                            Silakan masuk untuk melanjutkan proses pendaftaran.
                        </p>
                    </div>
                    {/* Login Form Suspense Wrapper */}
                    <Suspense fallback={<div className="p-8 text-center">Loading form...</div>}>
                        <LoginForm />
                    </Suspense>
                </div>
            </main>
            {/* Footer */}
            <footer className="w-full py-6 text-center border-t border-[#e7eef3] dark:border-slate-800 bg-white dark:bg-[#1A2632] mt-auto">
                <p className="text-[#4c759a] dark:text-slate-500 text-sm">
                    © 2026 MTsN 1 Pacitan. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
