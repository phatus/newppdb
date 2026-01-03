"use client";

import { useState } from "react";
import { validateDocument } from "@/app/actions/document-validation";

export default function ValidationForm() {
    const [regNo, setRegNo] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    async function handleValidate(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const response = await validateDocument(regNo);
            if (response.success) {
                setResult(response.data);
            } else {
                setError(response.error || "Validasi gagal");
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-lg mx-auto">
            <form onSubmit={handleValidate} className="flex gap-2 mb-8">
                <input
                    type="text"
                    placeholder="Masukkan Nomor Registrasi (8 digit)..."
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-lg uppercase"
                    maxLength={8}
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined">search</span>
                    )}
                    Cek
                </button>
            </form>

            {error && (
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 text-center animate-in fade-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-4xl mb-2">cancel</span>
                    <h3 className="font-bold text-lg">DATA TIDAK DITEMUKAN</h3>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-white border-2 border-emerald-500 rounded-xl overflow-hidden shadow-lg animate-in fade-in zoom-in duration-300">
                    <div className="bg-emerald-500 text-white p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="material-symbols-outlined text-3xl">verified</span>
                            <h3 className="font-bold text-xl uppercase tracking-wide">Dokumen Valid</h3>
                        </div>
                        <p className="text-emerald-100 text-sm">Data ditemukan dan terdaftar di sistem</p>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="text-center pb-4 border-b border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Nomor Registrasi</p>
                            <p className="text-3xl font-mono font-black text-slate-900 tracking-wider bg-slate-100 inline-block px-4 py-2 rounded-lg">{result.regNo}</p>
                        </div>

                        <div className="grid gap-3">
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="text-sm font-bold text-slate-500">Nama Lengkap</span>
                                <span className="font-bold text-slate-900">{result.namaLengkap}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="text-sm font-bold text-slate-500">NISN</span>
                                <span className="font-mono text-slate-900">{result.nisn}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="text-sm font-bold text-slate-500">Asal Sekolah</span>
                                <span className="text-slate-900">{result.asalSekolah}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="text-sm font-bold text-slate-500">Jalur</span>
                                <span className="text-slate-900 capitalize">{result.jalur?.replace(/_/g, " ").toLowerCase()}</span>
                            </div>
                            <div className="grid grid-cols-[120px_1fr] items-center">
                                <span className="text-sm font-bold text-slate-500">Status</span>
                                <div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${result.statusVerifikasi === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                                            result.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {result.statusVerifikasi || 'PENDING'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">Terdaftar sejak {new Date(result.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
