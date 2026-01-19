"use client";

import { useState } from "react";
import { reRegisterStudent } from "@/app/actions/student-re-registration";
import toast from "react-hot-toast";

interface ReRegistrationModalProps {
    studentId: string;
    studentName: string;
    activeWaveName: string;
    allowedJalur: string[]; // ["REGULER", "PRESTASI_AKADEMIK", ...]
}

export default function ReRegistrationModal({ studentId, studentName, activeWaveName, allowedJalur }: ReRegistrationModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedJalur, setSelectedJalur] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleReRegister = async () => {
        if (!selectedJalur) {
            toast.error("Pilih jalur pendaftaran terlebih dahulu");
            return;
        }

        if (!confirm(`Apakah Anda yakin ingin mendaftarkan ulang ${studentName} di jalur ${selectedJalur.replace(/_/g, " ")}?`)) {
            return;
        }

        setIsLoading(true);
        const result = await reRegisterStudent(studentId, { newJalur: selectedJalur });

        if (result.success) {
            toast.success("Berhasil mendaftar ulang!");
            setIsOpen(false);
            window.location.reload(); // Reload to show new status
        } else {
            toast.error(result.error || "Gagal mendaftar ulang");
        }
        setIsLoading(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-3 px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors border border-red-200"
            >
                Daftar Gelombang Selanjutnya
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                    Daftar Ulang: {activeWaveName}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    Anda akan mendaftarkan ulang <strong>{studentName}</strong> ke gelombang ini. Data dokumen sebelumnya akan tetap tersimpan.
                </p>

                <div className="space-y-3 mb-8">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Pilih Jalur Pendaftaran Baru
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {allowedJalur.map((jalur) => (
                            <button
                                key={jalur}
                                onClick={() => setSelectedJalur(jalur)}
                                className={`px-4 py-3 rounded-lg text-sm font-bold text-left border transition-all flex justify-between items-center ${selectedJalur === jalur
                                        ? "bg-primary text-white border-primary ring-2 ring-primary/20"
                                        : "bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                                    }`}
                            >
                                <span>{jalur.replace(/_/g, " ")}</span>
                                {selectedJalur === jalur && <span className="material-symbols-outlined text-[18px]">check_circle</span>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleReRegister}
                        disabled={isLoading || !selectedJalur}
                        className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </div>
            </div>
        </div>
    );
}
