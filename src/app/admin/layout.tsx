import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white">
            {/* Side Navigation */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700 h-full overflow-y-auto">
                <div className="p-4 flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-6">
                        {/* User Profile / Brand */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0 flex items-center justify-center">
                                <span className="material-symbols-outlined absolute text-slate-500">person</span>
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-tight truncate">
                                    PPDB Admin SMP
                                </h1>
                                <p className="text-slate-500 text-xs font-normal leading-normal truncate">
                                    Administrator Utama
                                </p>
                            </div>
                        </div>
                        {/* Navigation Links */}
                        <nav className="flex flex-col gap-2">
                            <Link
                                href="/admin/dashboard"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary group"
                            >
                                <span className="material-symbols-outlined icon-filled">
                                    dashboard
                                </span>
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                            <Link
                                href="/admin/students"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">group</span>
                                <span className="text-sm font-medium">Data Pendaftar</span>
                            </Link>
                            <Link
                                href="/admin/verification"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <div className="relative">
                                    <span className="material-symbols-outlined">fact_check</span>
                                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                                </div>
                                <span className="text-sm font-medium">Verifikasi Dokumen</span>
                            </Link>
                            <Link
                                href="#"
                                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium">Pengaturan</span>
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
                <header className="w-full px-6 py-5 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
                    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">
                                Dashboard Overview
                            </h2>
                            <p className="text-slate-500 text-sm">
                                Pantau perkembangan Penerimaan Peserta Didik Baru (PPDB) terkini.
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

                <div className="flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
