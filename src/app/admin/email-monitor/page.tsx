import { db } from "@/lib/db";
import Link from "next/link";
import { formatInWIB, getWIBStartOfDay, getWIBStartOfHour } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

async function getEmailStats() {
    const startOfHour = getWIBStartOfHour();
    const startOfDay = getWIBStartOfDay();

    const hourlyCount = await db.emailLog.count({
        where: {
            createdAt: { gt: startOfHour },
            status: "SUCCESS"
        }
    });

    const dailyCount = await db.emailLog.count({
        where: {
            createdAt: { gt: startOfDay },
            status: "SUCCESS"
        }
    });

    const recentLogs = await db.emailLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20
    });

    const totalCount = await db.emailLog.count();

    return { hourlyCount, dailyCount, recentLogs, totalCount };
}

export default async function EmailMonitorPage() {
    const { hourlyCount, dailyCount, recentLogs, totalCount } = await getEmailStats();

    // Hostinger Limits (Estimation)
    const HOURLY_LIMIT = 200;
    const hourlyUsagePercent = Math.min((hourlyCount / HOURLY_LIMIT) * 100, 100);

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Email Monitor
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Pantau penggunaan kuota SMTP Hostinger dan status pengiriman email.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">info</span>
                        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Kuota Hostinger: ~200/jam</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Penggunaan Jam Ini</span>
                        <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg text-lg">schedule</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{hourlyCount}</h3>
                        <span className="text-slate-400 text-sm">/ {HOURLY_LIMIT}</span>
                    </div>
                    <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${hourlyUsagePercent > 80 ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${hourlyUsagePercent}%` }}
                        ></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold">
                        {hourlyUsagePercent.toFixed(1)}% Terpakai
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Terkirim Hari Ini</span>
                        <span className="material-symbols-outlined text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-lg">today</span>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{dailyCount}</h3>
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                        Semua email sukses hari ini
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Total Selama Ini</span>
                        <span className="material-symbols-outlined text-purple-600 bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-lg">database</span>
                    </div>
                    <h3 className="text-4xl font-bold text-slate-900 dark:text-white">{totalCount}</h3>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wider font-bold">
                        Akumulasi Semua Data
                    </p>
                </div>
            </div>

            {/* Recent Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">history</span>
                        Log Pengiriman Terakhir
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-4">Waktu</th>
                                <th className="px-6 py-4">Penerima</th>
                                <th className="px-6 py-4">Tipe</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                                        Belum ada aktivitas email.
                                    </td>
                                </tr>
                            ) : recentLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                        {formatInWIB(log.createdAt, {
                                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                                            day: '2-digit', month: 'short'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                                        {log.to}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.status === "SUCCESS" ? (
                                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Sukses
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600 font-bold">
                                                <span className="material-symbols-outlined text-sm">error</span>
                                                Gagal
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">
                                        {log.error || log.subject}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
