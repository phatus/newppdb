"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface RankingData {
    id: string;
    namaLengkap: string;
    nisn: string;
    asalSekolah: string | null;
    jalur: string;
    grades: {
        finalScore: number;
        nilaiPrestasi: number | null;
    } | null;
}

export default function LiveRankingTable({ initialData }: { initialData: any[] }) {
    const router = useRouter();
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            handleRefresh();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.refresh(); // Tells Next.js to re-fetch server components
        setTimeout(() => {
            setLastUpdate(new Date());
            setIsRefreshing(false);
        }, 1000); // Artificial delay to show animation
    };

    // Mask NISN for privacy (show last 4 digits)
    const maskNISN = (nisn: string) => {
        if (!nisn) return "-";
        return "******" + nisn.slice(-4);
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span>Live Update</span>
                    <span className="text-slate-300">|</span>
                    <span>Terakhir: {format(lastUpdate, "HH:mm:ss", { locale: id })}</span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-700 disabled:opacity-50 transition-colors"
                >
                    <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? "animate-spin" : ""}`}>refresh</span>
                    Refresh
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0f172a] text-white">
                            <tr>
                                <th className="px-6 py-4 font-bold w-16 text-center">Rank</th>
                                <th className="px-6 py-4 font-bold">Nama Siswa</th>
                                <th className="px-6 py-4 font-bold">Asal Sekolah</th>
                                <th className="px-6 py-4 font-bold w-32 text-center">Jalur</th>
                                <th className="px-6 py-4 font-bold w-32 text-center text-yellow-400">Total Skor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {initialData.map((student, index) => (
                                <tr
                                    key={student.id}
                                    className={`
                                        hover:bg-slate-50 transition-colors
                                        ${index < 3 ? 'bg-yellow-50/50' : ''}
                                    `}
                                >
                                    <td className="px-6 py-4 text-center">
                                        {index === 0 && <span className="text-2xl">🥇</span>}
                                        {index === 1 && <span className="text-2xl">🥈</span>}
                                        {index === 2 && <span className="text-2xl">🥉</span>}
                                        {index > 2 && <span className="font-bold text-slate-500">#{index + 1}</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 text-base">{student.namaLengkap}</span>
                                            <span className="text-xs text-slate-400 font-mono">NISN: {maskNISN(student.nisn)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {student.asalSekolah || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`
                                            px-2 py-1 rounded text-[10px] font-bold uppercase
                                            ${student.jalur === 'REGULER' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {student.jalur.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-lg font-black text-primary">
                                            {student.grades?.finalScore?.toFixed(2) || "0.00"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {initialData.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        Belum ada data perangkingan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
                <p>* Perangkingan diperbarui secara otomatis setiap saat.</p>
                <p>Keputusan panitia PPDB bersifat mutlak dan tidak dapat diganggu gugat.</p>
            </div>
        </div>
    );
}
