"use client";

import { useState } from "react";
import { updateSettings, updateSignature } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

export default function CommitteeSettings({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);
    const [committeeName, setCommitteeName] = useState(initialData?.committeeName || "");
    const [signatureUrl, setSignatureUrl] = useState(initialData?.committeeSignature || "");

    async function handleSaveName() {
        setLoading(true);
        try {
            const res = await updateSettings({ committeeName });
            if (res.success) {
                toast.success("Nama Ketua Panitia disimpan");
            } else {
                toast.error(res.error || "Gagal simpan");
            }
        } catch (e) {
            toast.error("Terjadi kesalahan");
        } finally {
            setLoading(false);
        }
    }

    async function handleUploadSignature(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("signature", file);

        try {
            const res = await updateSignature(formData);
            if (res.success) {
                setSignatureUrl(res.url!);
                toast.success("Tanda tangan diupload");
            } else {
                toast.error(res.error || "Gagal upload");
            }
        } catch (err) {
            toast.error("Kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Nama Ketua Panitia
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={committeeName}
                            onChange={(e) => setCommitteeName(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Contoh: Nama Ketua, S.Pd"
                        />
                        <button
                            onClick={handleSaveName}
                            disabled={loading}
                            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Simpan
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tanda Tangan Elektronik
                    </label>
                    <div className="flex flex-col gap-3">
                        {signatureUrl && (
                            <div className="relative group w-fit">
                                <img
                                    src={signatureUrl}
                                    alt="Signature"
                                    className="h-20 object-contain bg-white rounded border border-slate-200 p-2"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                                    <span className="text-[10px] text-white">Pratinjau</span>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadSignature}
                            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-[10px] text-slate-500">Gunakan file PNG transparan untuk hasil terbaik.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
