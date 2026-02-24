"use client";

import { autoSelectStudents } from "@/app/actions/ranking";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function AutoSelectionButton({ quota, waveId }: { quota: number, waveId?: string }) {
    const [loading, setLoading] = useState(false);

    async function handleAutoSelect() {
        const confirmMsg = waveId && waveId !== "all"
            ? `Apakah Anda yakin ingin melakukan seleksi otomatis khusus untuk GELOMBANG ini?\n\nSistem akan menggunakan kuota per jalur yang diatur pada gelombang ini.\n\nTindakan ini akan mengupdate status kelulusan murid.`
            : `Apakah Anda yakin ingin melakukan seleksi otomatis untuk SEMUA GELOMBANG?\n\n${quota} murid dengan peringkat tertinggi akan dinyatakan LULUS.\n\nTindakan ini akan mengupdate status kelulusan murid.`;

        if (!confirm(confirmMsg)) {
            return;
        }

        setLoading(true);
        try {
            const filters = waveId && waveId !== "all" ? { waveId } : undefined;
            const res = await autoSelectStudents(filters);
            if (res.success) {
                toast.success(res.message || "Seleksi berhasil");
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
