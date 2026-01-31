"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { formatInWIB } from "@/lib/date-utils";

interface RankingData {
    id: string;
    namaLengkap: string;
    nisn: string;
    asalSekolah: string | null;
    jalur: string;
    statusKelulusan: string;
    grades: {
        finalScore: number;
        nilaiPrestasi: number | null;
    } | null;
}

export default function LiveRankingTable({ initialData }: { initialData: RankingData[] }) {
    const router = useRouter();
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredData = initialData.filter((student) => {
        const searchLower = searchTerm.toLowerCase();
        return (
            student.namaLengkap.toLowerCase().includes(searchLower) ||
            student.nisn.includes(searchTerm)
        );
    });

    return (
        <div className="w-full">
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {/* Control Bar Inside Card for better contrast */}
                <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span>Live Update</span>
                        <span className="text-slate-300">|</span>
                        <span>Terakhir: {formatInWIB(lastUpdate, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                            <input
                                type="text"
                                placeholder="Cari Nama atau NISN..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white text-slate-900 placeholder:text-slate-400 shadow-sm"
                            />
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-primary hover:bg-slate-50 disabled:opacity-50 transition-all shadow-sm active:scale-95"
                        >
                            <span className={`material-symbols-outlined text-[20px] ${isRefreshing ? "animate-spin" : ""}`}>refresh</span>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0f172a] text-white">
                            <tr>
                                <th className="px-6 py-4 font-bold w-16 text-center">Rank</th>
                                <th className="px-6 py-4 font-bold">Nama Murid</th>
                                <th className="px-6 py-4 font-bold">Asal Sekolah</th>
                                <th className="px-6 py-4 font-bold w-32 text-center">Jalur</th>
                                <th className="px-6 py-4 font-bold w-32 text-center text-emerald-400">Hasil</th>
                                <th className="px-6 py-4 font-bold w-32 text-center text-yellow-400">Total Skor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredData.map((student, index) => {
                                // Find the original rank from initialData
                                const rank = initialData.findIndex(s => s.id === student.id) + 1;
                                return (
                                    <tr
                                        key={student.id}
                                        className={`
                                        hover:bg-slate-50 transition-colors
                                        ${rank <= 3 ? 'bg-yellow-50/50' : ''}
                                    `}
                                    >
                                        <td className="px-6 py-4 text-center">
                                            {rank === 1 && <span className="text-2xl">🥇</span>}
                                            {rank === 2 && <span className="text-2xl">🥈</span>}
                                            {rank === 3 && <span className="text-2xl">🥉</span>}
                                            {rank > 3 && <span className="font-bold text-slate-500">#{rank}</span>}
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
                                            px-2 py-1 rounded text-[10px] font-bold
                                            ${student.jalur === 'REGULER' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                                {student.jalur.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`
                                            px-2 py-1 rounded text-[10px] font-bold
                                            ${student.statusKelulusan === 'LULUS' ? 'bg-emerald-100 text-emerald-700' :
                                                    student.statusKelulusan === 'TIDAK_LULUS' ? 'bg-red-100 text-red-700' :
                                                        'bg-slate-100 text-slate-600'}
                                        `}>
                                                {student.statusKelulusan === 'LULUS' ? 'DITERIMA' :
                                                    student.statusKelulusan === 'TIDAK_LULUS' ? 'TIDAK DITERIMA' :
                                                        'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-lg font-black text-primary">
                                                {student.grades?.finalScore?.toFixed(2) || "0.00"}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {initialData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        {searchTerm ? "Tidak ada hasil ditemukan." : "Belum ada data perangkingan."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-400">
                <p>* Perangkingan diperbarui secara otomatis setiap saat.</p>
                <p>Keputusan panitia SPMB bersifat mutlak dan tidak dapat diganggu gugat.</p>
            </div>
        </div>
    );
}
