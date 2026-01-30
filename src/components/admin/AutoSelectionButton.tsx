"use client";

import { autoSelectStudents } from "@/app/actions/ranking";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AutoSelectionButton({ quota }: { quota: number }) {
    const [loading, setLoading] = useState(false);

    async function handleAutoSelect() {
        if (!confirm(`Apakah Anda yakin ingin melakukan seleksi otomatis?\n\n${quota} murid dengan peringkat tertinggi akan dinyatakan LULUS.\nSisanya akan dinyatakan TIDAK LULUS.\n\nTindakan ini akan mengupdate status kelulusan murid.`)) {
            return;
        }

        setLoading(true);
        try {
            const res = await autoSelectStudents();
            if (res.success) {
                toast.success(res.message || "Seleksi berhasil");
                // Optional: Reload to see updated table if it showed status
                window.location.reload();
            } else {
                toast.error(res.error || "Gagal melakukan seleksi");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleAutoSelect}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-bold text-sm transition-colors disabled:opacity-50"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Memproses...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Seleksi Otomatis
                </>
            )}
        </button>
    );
}
