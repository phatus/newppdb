"use client";

import { useState } from "react";
import { blastFinalStatus } from "@/app/actions/notifications";
import { toast } from "react-hot-toast";

export default function WABlastPanel() {
    const [quota, setQuota] = useState(30);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    async function handleBlast() {
        setLoading(true);
        try {
            const res = await blastFinalStatus(quota);
            if (res.success) {
                toast.success(`Blast selesai! ${res.successCount} dikirim, ${res.failCount} gagal.`);
                setShowModal(false);
            } else {
                toast.error(res.error || "Gagal kirim");
            }
        } catch (e) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
                <span className="material-symbols-outlined">send</span>
                Blast Pengumuman WA
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Blast Pengumuman WA</h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Pesan akan dikirim ke seluruh siswa yang ada di tabel ranking. Peringkat 1 sampai <strong>{quota}</strong> akan dinyatakan <strong>DITERIMA</strong>.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Kuota Penerimaan
                                </label>
                                <input
                                    type="number"
                                    value={quota}
                                    onChange={(e) => setQuota(parseInt(e.target.value))}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleBlast}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Mengirim..." : "Mulai Kirim"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
