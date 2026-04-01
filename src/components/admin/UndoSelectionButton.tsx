"use client";

import { undoMovedStudents } from "@/app/actions/ranking";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function UndoSelectionButton({ waveId }: { waveId?: string }) {
    const [loading, setLoading] = useState(false);

    async function handleUndo() {
        const confirmMsg = waveId && waveId !== "all"
            ? `Apakah Anda yakin ingin melakukan UNDO SELEKSI untuk GELOMBANG ini?\n\nSemua murid yang sempat terlempar ke Reguler karena penuh akan dikembalikan ke jalur Prestasi/Afirmasi asalnya. Status kelulusan akan direset menjadi PENDING.\n\nTindakan ini tidak bisa dibatalkan.`
            : `Apakah Anda yakin ingin melakukan UNDO SELEKSI untuk SEMUA GELOMBANG?\n\nSemua murid yang sempat terlempar ke Reguler akan dikembalikan ke jalur asalnya. Status kelulusan semua murid direset menjadi PENDING.\n\nTindakan ini tidak bisa dibatalkan.`;

        if (!confirm(confirmMsg)) {
            return;
        }

        setLoading(true);
        try {
            const res = await undoMovedStudents(waveId);
            if (res.success) {
                toast.success(res.message || "Undo berhasil");
                window.location.reload();
            } else {
                toast.error(res.error || "Gagal melakukan undo");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleUndo}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm font-bold text-sm transition-colors disabled:opacity-50"
            title="Kembalikan jalur siswa yang terlempar ke Reguler dan Reset Status Kelulusan"
        >
            {loading ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Memproses...
                </>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[18px]">undo</span>
                    Undo Seleksi
                </>
            )}
        </button>
    );
}
