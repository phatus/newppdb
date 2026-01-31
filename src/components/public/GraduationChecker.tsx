"use client";

import { useState } from "react";
import { checkGraduationStatus } from "@/app/actions/public";
import toast from "react-hot-toast";

export default function GraduationChecker() {
    const [nisn, setNisn] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nisn) {
            toast.error("Masukkan NISN terlebih dahulu");
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const res = await checkGraduationStatus(nisn);
            if (res.success && res.data) {
                setResult(res.data);
                if (res.data.status === 'LULUS') {
                    toast.success("Data ditemukan!");
                } else {
                    toast("Data ditemukan", { icon: 'ℹ️' });
                }
            } else {
                toast.error(res.error || "Data tidak ditemukan");
                setResult(null);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-[#15202b] rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-primary/5 p-8 sm:p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                    <span className="material-symbols-outlined text-4xl">travel_explore</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                    Cek Status Penerimaan
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-8">
                    Masukkan Nomor Induk Murid Nasional (NISN) anda untuk mengecek hasil seleksi SPMB tahun ini.
                </p>

                <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                    <input
                        type="text"
                        placeholder="Masukkan NISN (Contoh: 0012345678)"
                        className="flex-1 px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
                        value={nisn}
                        onChange={(e) => setNisn(e.target.value.replace(/\D/g, ''))} // Only numbers
                        maxLength={10}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">search</span>
                                <span>Cek</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {result && (
                <div className="p-8 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <div className={`rounded-xl p-6 border-l-4 shadow-sm ${result.status === 'LULUS'
                        ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500'
                        : 'bg-red-50 dark:bg-red-900/10 border-red-500'
                        }`}>
                        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${result.status === 'LULUS' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                <span className="material-symbols-outlined text-4xl">
                                    {result.status === 'LULUS' ? 'celebration' : 'sentiment_very_dissatisfied'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${result.status === 'LULUS' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'
                                    }`}>
                                    {result.status === 'LULUS' ? 'DITERIMA' : 'TIDAK DITERIMA'}
                                </span>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {result.nama}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                                    <p>NISN: <span className="font-mono font-medium text-slate-900 dark:text-slate-200">{result.nisn}</span></p>
                                    <p>Jalur: <span className="font-medium text-slate-900 dark:text-slate-200">{result.jalur}</span></p>
                                </div>

                                {result.status === 'LULUS' && (
                                    <div className="mt-4 p-3 bg-white dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-emerald-100 dark:border-emerald-900/30">
                                        <p>Selamat! Anda diterima di Jalur <strong>{result.jalur}</strong>. Silakan lakukan daftar ulang sesuai jadwal yang ditentukan.</p>
                                    </div>
                                )}
                                {result.status === 'TIDAK_LULUS' && (
                                    <div className="mt-4 p-3 bg-white dark:bg-slate-800/50 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-red-100 dark:border-red-900/30">
                                        <p>Mohon maaf, Anda belum diterima. Tetap semangat!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
