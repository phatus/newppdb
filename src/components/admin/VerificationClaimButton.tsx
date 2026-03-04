"use client";

import { useState, useTransition } from "react";
import { claimStudent, releaseStudent } from "@/app/actions/verification-team";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Props {
    studentId: string;
    isClaimed: boolean;
    isClaimedByMe: boolean;
    verifierName: string | null;
}

export default function VerificationClaimButton({ studentId, isClaimed, isClaimedByMe, verifierName }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleClaim = () => {
        startTransition(async () => {
            const result = await claimStudent(studentId);
            if (result.success) {
                toast.success("Berhasil mengambil data murid ini");
                router.refresh();
            } else {
                toast.error(result.error || "Gagal mengambil");
            }
        });
    };

    const handleRelease = () => {
        startTransition(async () => {
            const result = await releaseStudent(studentId);
            if (result.success) {
                toast.success("Murid dikembalikan ke antrian");
                router.refresh();
            } else {
                toast.error(result.error || "Gagal melepas");
            }
        });
    };

    if (!isClaimed) {
        return (
            <button
                onClick={handleClaim}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
            >
                {isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                )}
                Ambil untuk Verifikasi
            </button>
        );
    }

    if (isClaimedByMe) {
        return (
            <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    Ditangani oleh Anda
                </span>
                <button
                    onClick={handleRelease}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    title="Kembalikan ke antrian"
                >
                    {isPending ? (
                        <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-[16px]">person_remove</span>
                    )}
                    Lepas
                </button>
            </div>
        );
    }

    // Claimed by someone else
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium border border-amber-200 dark:border-amber-800">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            Ditangani oleh {verifierName}
        </span>
    );
}
