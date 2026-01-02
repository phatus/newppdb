"use client";

import { useState } from "react";
import { updateSettings } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

export default function WASettings({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);
    const [isWaEnabled, setIsWaEnabled] = useState(initialData?.isWaEnabled || false);
    const [waGatewayToken, setWaGatewayToken] = useState(initialData?.waGatewayToken || "");
    const [waGatewayUrl, setWaGatewayUrl] = useState(initialData?.waGatewayUrl || "https://api.fonnte.com/send");

    async function handleSave() {
        setLoading(true);
        try {
            const res = await updateSettings({
                isWaEnabled,
                waGatewayToken,
                waGatewayUrl
            });
            if (res.success) {
                toast.success("Pengaturan WhatsApp disimpan");
            } else {
                toast.error(res.error || "Gagal simpan");
            }
        } catch (e) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Status WA Gateway</h3>
                    <p className="text-xs text-slate-500">Aktifkan untuk mengirim pesan otomatis ke pendaftar.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isWaEnabled}
                        onChange={(e) => setIsWaEnabled(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        API Token / API Key
                    </label>
                    <input
                        type="password"
                        value={waGatewayToken}
                        onChange={(e) => setWaGatewayToken(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Masukkan token dari vendor (misal Fonnte)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Gateway URL
                    </label>
                    <input
                        type="text"
                        value={waGatewayUrl}
                        onChange={(e) => setWaGatewayUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="https://api.fonnte.com/send"
                    />
                </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-lg">
                <div className="flex gap-3">
                    <span className="material-symbols-outlined text-amber-600">info</span>
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        Aplikasi ini default menggunakan API dari <strong>Fonnte</strong>. Jika Anda menggunakan vendor lain dengan parameter berbeda,
                        perlu penyesuaian kode pada file <code>src/lib/whatsapp.ts</code>.
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {loading ? "Menyimpan..." : "Simpan Pengaturan WA"}
                </button>
            </div>
        </div>
    );
}
