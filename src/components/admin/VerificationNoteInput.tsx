"use client";

import { useState } from "react";
import { updateVerificationNote } from "@/app/actions/verification-team";
import toast from "react-hot-toast";

interface Props {
    studentId: string;
    initialNote: string;
}

export default function VerificationNoteInput({ studentId, initialNote }: Props) {
    const [note, setNote] = useState(initialNote);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (note === initialNote) return; // No change

        setIsSaving(true);
        const result = await updateVerificationNote(studentId, note);
        setIsSaving(false);

        if (result.success) {
            toast.success("Catatan disimpan");
        } else {
            toast.error(result.error || "Gagal menyimpan catatan");
        }
    };

    return (
        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">sticky_note_2</span>
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">Catatan Internal Tim</h3>
                {isSaving && (
                    <span className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin ml-auto" />
                )}
            </div>
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSave}
                placeholder="Tulis catatan untuk tim verifikasi (hanya terlihat oleh admin)..."
                className="w-full rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all resize-none placeholder:italic"
                rows={2}
            />
        </div>
    );
}
