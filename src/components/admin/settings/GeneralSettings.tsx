"use client";

import { useState } from "react";
import { updateSettings, updateLogo } from "@/app/actions/settings";
import { toast } from "react-hot-toast";

interface GeneralSettingsProps {
    initialData: any;
}

export default function GeneralSettings({ initialData }: GeneralSettingsProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const schoolName = formData.get("schoolName") as string;
        const schoolAddress = formData.get("schoolAddress") as string;
        const res = await updateSettings({
            schoolName,
            schoolAddress
        });

        if (res.success) {
            toast.success("Pengaturan umum berhasil disimpan");
        } else {
            toast.error(res.error || "Gagal menyimpan pengaturan");
        }
        setLoading(false);
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("logo", file);

        setUploading(true);
        const res = await updateLogo(formData);

        if (res.success) {
            toast.success("Logo berhasil diperbarui");
            // Reload to reflect changes
            window.location.reload();
        } else {
            toast.error(res.error || "Gagal mengupload logo");
        }
        setUploading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl">
            {/* Logo Section */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Logo Sekolah
                </label>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-600 overflow-hidden relative">
                        {initialData?.schoolLogo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={initialData.schoolLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                        ) : (
                            <span className="material-symbols-outlined text-slate-400">image</span>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-50 transition-colors inline-block w-fit">
                            <span>{uploading ? "Mengupload..." : "Upload Logo Baru"}</span>
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleLogoChange}
                                disabled={uploading}
                            />
                        </label>
                        <p className="text-[10px] text-slate-400">
                            Format: PNG, JPG (Max 2MB)
                        </p>
                    </div>
                </div>
            </div>



            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Sekolah
                </label>
                <input
                    name="schoolName"
                    type="text"
                    defaultValue={initialData?.schoolName || "Nama Sekolah"}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Contoh: SMA Negeri 1 ..."
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Lengkap
                </label>
                <textarea
                    name="schoolAddress"
                    defaultValue={initialData?.schoolAddress || ""}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
                    placeholder="Alamat sekolah..."
                />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Menyimpan...
                        </>
                    ) : (
                        "Simpan Perubahan"
                    )}
                </button>
            </div>
        </form>
    );
}
