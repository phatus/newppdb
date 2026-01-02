import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await db.schoolSettings.findFirst();
    const schoolName = settings?.schoolName || "PPDB Admin SMP";
    const schoolLogo = settings?.schoolLogo;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white">
            {/* Side Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700/50 h-full overflow-y-auto">
                <div className="p-4 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-5">
                        {/* User Profile / Brand */}
                        <div className="flex items-center gap-3 px-1.5 pb-2 border-b border-slate-50 dark:border-slate-800/50">
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                {schoolLogo ? (
                                    <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined absolute text-slate-500">school</span>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-slate-900 dark:text-white text-xs font-bold leading-tight truncate uppercase tracking-tight" title={schoolName}>
                                    {schoolName}
                                </h1>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">
                                    ADMINISTRATOR
                                </p>
                            </div>
                        </div>
                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-1.5">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all border border-transparent bg-primary/10 text-primary hover:bg-primary/20"
                            >
                                <span className="material-symbols-outlined icon-filled text-[20px]">
                                    dashboard
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wide">Dashboard</span>
                            </Link>
                            <Link
                                href="/admin/students"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">group</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Pendaftar</span>
                            </Link>
                            <Link
                                href="/admin/verification"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <div className="relative">
                                    <span className="material-symbols-outlined text-[20px]">fact_check</span>
                                    <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white dark:ring-[#1e293b]"></span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wide">Verifikasi</span>
                            </Link>
                            <Link
                                href="/admin/grades"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Olah Nilai</span>
                            </Link>
                            <Link
                                href="/admin/ranking"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">leaderboard</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Rangking</span>
                            </Link>
                            <Link
                                href="/admin/subjects"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">menu_book</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Mapel</span>
                            </Link>
                            <Link
                                href="/admin/announcements"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">campaign</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Info</span>
                            </Link>
                            <Link
                                href="/admin/reports"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">print</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Laporan</span>
                            </Link>
                            <Link
                                href="/admin/logs"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">history</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Audit</span>
                            </Link>
                            <Link
                                href="/admin/settings"
                                className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary transition-all border border-transparent"
                            >
                                <span className="material-symbols-outlined text-[20px]">settings</span>
                                <span className="text-xs font-bold uppercase tracking-wide">Pengaturan</span>
                            </Link>
                        </nav>
                    </div>
                    {/* Bottom Action */}
                    <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative">
                {/* Header */}
                <header className="w-full px-6 py-3.5 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-20">
                    <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                                Overview PPDB
                            </h2>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <label className="relative flex items-center md:w-80 h-10 w-full group">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                                    <span className="material-symbols-outlined text-[20px]">
                                        search
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari siswa (nama/no. pendaftaran)..."
                                    className="block w-full h-full pl-10 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-slate-900 transition-all"
                                />
                            </label>
                            <button className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500"></span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 bg-background-light dark:bg-[#101a22]">
                    {children}
                </div>
            </main>
        </div>
    );
}
