import { db } from "@/lib/db";
import Link from "next/link";
import { getDashboardAnalytics } from "@/app/actions/analytics";
import DashboardCharts from "@/components/admin/DashboardCharts";

export default async function AdminDashboardPage() {
    // 1. Fetch Key Metrics in Parallel
    const [
        totalStudents,
        pendingCount,
        verifiedCount,
        rejectedCount,
        recentStudents,
        analyticsData
    ] = await Promise.all([
        db.student.count(),
        db.student.count({ where: { statusVerifikasi: "PENDING" } }),
        db.student.count({ where: { statusVerifikasi: "VERIFIED" } }),
        db.student.count({ where: { statusVerifikasi: "REJECTED" } }),
        db.student.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
        }),
        getDashboardAnalytics()
    ]);

    // Helper for time formatting (simple relative time)
    const timeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " tahun lalu";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " bulan lalu";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " hari lalu";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " jam lalu";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " menit lalu";
        return "Baru saja";
    };

    return (
        <div className="p-5 w-full max-w-[1240px] mx-auto flex flex-col gap-5">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                            <span className="material-symbols-outlined icon-filled text-[20px]">
                                groups
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                            Total Pendaftar
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                            {totalStudents}
                        </h3>
                    </div>
                </div>
                {/* Pending Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 relative overflow-hidden transition-all hover:shadow-md">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-yellow-400/5 rounded-bl-full -mr-2 -mt-2"></div>
                    <div className="flex justify-between items-start">
                        <div className="p-1.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                            <span className="material-symbols-outlined icon-filled text-[20px]">
                                pending_actions
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-2 py-0.5 text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-tight">
                            Perlu Tindakan
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                            Menunggu Verifikasi
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                            {pendingCount}
                        </h3>
                    </div>
                </div>
                {/* Verified Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                            <span className="material-symbols-outlined icon-filled text-[20px]">
                                verified
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                            Sudah Terverifikasi
                        </p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                            {verifiedCount}
                        </h3>
                    </div>
                </div>
                {/* Rejected Card */}
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col gap-3 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start">
                        <div className="p-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600">
                            <span className="material-symbols-outlined icon-filled text-[20px]">
                                cancel
                            </span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Ditolak</p>
                        <h3 className="text-slate-900 dark:text-white text-2xl font-bold">
                            {rejectedCount}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Advanced Analytics Charts */}
            {analyticsData && (
                <div className="bg-white dark:bg-[#1e293b] rounded-xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-sm">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
                        Analitik Pendaftaran
                    </h2>
                    <DashboardCharts data={analyticsData} />
                </div>
            )}

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 gap-5">
                <div className="flex flex-col bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 p-5">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-slate-900 dark:text-white text-base font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                            Pendaftar Terbaru
                        </h3>
                        <Link href="/admin/students" className="text-primary text-xs font-bold hover:underline bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full transition-colors">
                            Lihat Semua
                        </Link>
                    </div>
                    <div className="flex flex-col divide-y divide-slate-100 dark:divide-slate-700/50">
                        {recentStudents.length === 0 ? (
                            <p className="text-sm text-slate-500 italic py-4">Belum ada aktivitas pendaftaran.</p>
                        ) : (
                            recentStudents.map((student: any) => (
                                <div key={student.id} className="flex items-center gap-4 py-3 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors rounded-lg px-2 -mx-2">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center border border-blue-100 dark:border-blue-800">
                                        <span className="material-symbols-outlined text-[16px]">
                                            person
                                        </span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                            {student.namaLengkap}
                                        </p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                                            <span className="font-medium text-primary/80">{timeAgo(student.createdAt)}</span>
                                            <span>•</span>
                                            <span>NISN: {student.nisn || '-'}</span>
                                            <span>•</span>
                                            <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{student.jalur || 'Reguler'}</span>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <Link href={`/admin/verification/${student.id}`} className="text-[11px] bg-white dark:bg-slate-900 hover:bg-primary hover:text-white transition-all text-primary border border-primary/20 dark:border-primary/40 px-4 py-1.5 rounded-full font-bold">
                                            VERIFIKASI
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Statistics Link */}
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center">
                <Link href="/admin/students" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    Eksplorasi Seluruh Data Pendaftar
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
}
