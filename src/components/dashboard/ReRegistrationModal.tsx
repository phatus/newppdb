"use client";

import { useState, useEffect } from "react";
import { reRegisterStudent } from "@/app/actions/student-re-registration";
// import toast from "react-hot-toast"; // Replaced by Swal for "bagus" notification
import Swal from "sweetalert2";

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

    // Auto-select if only one option
    useEffect(() => {
        if (isOpen && allowedJalur.length === 1) {
            setSelectedJalur(allowedJalur[0]);
        }
    }, [isOpen, allowedJalur]);

    const handleReRegister = async () => {
        if (!selectedJalur) {
            Swal.fire({
                icon: "warning",
                title: "Pilih Jalur",
                text: "Silakan pilih jalur pendaftaran terlebih dahulu.",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        const result = await Swal.fire({
            title: "Konfirmasi Pendaftaran",
            text: `Apakah Anda yakin ingin mendaftarkan ulang ${studentName} di jalur ${selectedJalur.replace(/_/g, " ")}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, Daftar Sekarang",
            cancelButtonText: "Batal"
        });

        if (!result.isConfirmed) return;

        setIsLoading(true);

        // Show loading alert
        Swal.fire({
            title: 'Memproses...',
            text: 'Mohon tunggu sebentar.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await reRegisterStudent(studentId, { newJalur: selectedJalur });

            if (response.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Pendaftaran ulang berhasil dilakukan.",
                    confirmButtonColor: "#3085d6",
                });
                setIsOpen(false);
                window.location.reload();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: response.error || "Terjadi kesalahan saat mendaftar ulang.",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan sistem.",
                confirmButtonColor: "#d33",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-3 px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-lg hover:bg-red-50 transition-colors border border-red-200 shadow-sm"
            >
                Daftar Gelombang Selanjutnya
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Daftar Ulang: {activeWaveName}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Siswa: <span className="font-semibold text-slate-700 dark:text-slate-200">{studentName}</span>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-4 rounded-xl text-sm mb-6 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-xl shrink-0">info</span>
                    <p>
                        Data dokumen sebelumnya akan tetap tersimpan. Anda hanya perlu memilih jalur pendaftaran baru.
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                        Pilih Jalur Pendaftaran Baru
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                        {allowedJalur.map((jalur) => (
                            <button
                                key={jalur}
                                onClick={() => setSelectedJalur(jalur)}
                                className={`px-4 py-3 rounded-xl text-sm font-bold text-left border-2 transition-all flex justify-between items-center group ${selectedJalur === jalur
                                    ? "bg-primary/5 border-primary text-primary"
                                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700"
                                    }`}
                            >
                                <span className="group-hover:translate-x-1 transition-transform duration-200">{jalur.replace(/_/g, " ")}</span>
                                {selectedJalur === jalur ? (
                                    <span className="material-symbols-outlined text-[20px] animate-in zoom-in spin-in-90 duration-300">check_circle</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px] text-slate-300 group-hover:text-primary/50">radio_button_unchecked</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-all"
                        disabled={isLoading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleReRegister}
                        disabled={isLoading || !selectedJalur}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {isLoading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </div>
            </div>
        </div>
    );
}
