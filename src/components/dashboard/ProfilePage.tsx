"use client";

import { useState } from "react";
import { updateProfile } from "@/app/actions/users";
import { toast } from "react-hot-toast";

interface ProfilePageProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
    };
}

export default function ProfilePage({ user }: ProfilePageProps) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (password && password !== confirmPassword) {
            toast.error("Konfirmasi password tidak cocok");
            setLoading(false);
            return;
        }

        const res = await updateProfile({
            name,
            ...(password ? { password } : {})
        });

        if (res.success) {
            toast.success("Profil berhasil diperbarui");
            (e.target as HTMLFormElement).password.value = "";
            (e.target as HTMLFormElement).confirmPassword.value = "";
        } else {
            toast.error(res.error || "Gagal memperbarui profil");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            <header className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Akun</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola informasi profil dan keamanan akun Anda.</p>
            </header>

            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center gap-4">
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-4xl">account_circle</span>
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 dark:text-white text-lg">{user.name || "User"}</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{user.email}</p>
                        <div className="mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-100 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Akun Online
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nama Lengkap</label>
                            <input
                                name="name"
                                type="text"
                                defaultValue={user.name || ""}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                                placeholder="Masukkan nama Anda"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email (ID Akun)</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-slate-500 text-sm outline-none cursor-not-allowed"
                            />
                            <p className="text-[10px] text-slate-400">Email tidak dapat diubah secara mandiri.</p>
                        </div>

                        <hr className="my-2 border-slate-100 dark:border-slate-800" />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password Baru</label>
                            <input
                                name="password"
                                type="password"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                                placeholder="••••••••"
                            />
                            <p className="text-[10px] text-slate-400">Kosongkan jika tidak ingin mengubah password.</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Konfirmasi Password Baru</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/50 transition-all text-sm outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex gap-3">
                <span className="material-symbols-outlined text-blue-500">info</span>
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Sistem akan memantau status aktivitas Anda untuk memastikan akun tetap aman. Jika Anda mengganti password, pastikan untuk mencatatnya dengan baik.
                </p>
            </div>
        </div>
    );
}
