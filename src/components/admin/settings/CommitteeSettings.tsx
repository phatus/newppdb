"use client";

import { useState } from "react";
import { updateSettings, updateSignature } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

export default function CommitteeSettings({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);

    // Committee State
    const [committeeName, setCommitteeName] = useState(initialData?.committeeName || "");
    const [committeeNip, setCommitteeNip] = useState(initialData?.committeeNip || "");
    const [signatureUrl, setSignatureUrl] = useState(initialData?.committeeSignature || "");

    // Principal State
    const [principalName, setPrincipalName] = useState(initialData?.principalName || "");
    const [principalNip, setPrincipalNip] = useState(initialData?.principalNip || "");

    // Location
    const [schoolCity, setSchoolCity] = useState(initialData?.schoolCity || "");

    async function handleSave() {
        setLoading(true);
        try {
            const res = await updateSettings({
                committeeName,
                committeeNip,
                principalName,
                principalNip,
                schoolCity
            });
            if (res.success) {
                toast.success("Informasi pejabat disimpan");
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
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Principal */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white border-b pb-2">Kepala Sekolah</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nama Kepala Sekolah
                        </label>
                        <input
                            type="text"
                            value={principalName}
                            onChange={(e) => setPrincipalName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                            placeholder="Contoh: Budi Santoso, S.Pd, M.Pd"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            NIP Kepala Sekolah
                        </label>
                        <input
                            type="text"
                            value={principalNip}
                            onChange={(e) => setPrincipalNip(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                            placeholder="Contoh: 19800101 200501 1 001"
                        />
                    </div>
                </div>

                {/* Right Column: Committee */}
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white border-b pb-2">Ketua Panitia PPDB</h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Nama Ketua Panitia
                        </label>
                        <input
                            type="text"
                            value={committeeName}
                            onChange={(e) => setCommitteeName(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                            placeholder="Contoh: Ani Suryani, S.Pd"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            NIP Ketua Panitia
                        </label>
                        <input
                            type="text"
                            value={committeeNip}
                            onChange={(e) => setCommitteeNip(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                            placeholder="Contoh: 19850505 201001 2 005"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Tanda Tangan Elektronik
                        </label>
                        <div className="flex flex-col gap-3">
                            {signatureUrl && (
                                <div className="p-2 border border-slate-200 rounded bg-white w-fit">
                                    <img
                                        src={signatureUrl}
                                        alt="Signature"
                                        className="h-16 object-contain"
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadSignature}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom: Location & Save */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <div className="max-w-md mb-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tempat Penetapan (Kota)
                    </label>
                    <input
                        type="text"
                        value={schoolCity}
                        onChange={(e) => setSchoolCity(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-slate-900 dark:text-white"
                        placeholder="Contoh: Jakarta"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
