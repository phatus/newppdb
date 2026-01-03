"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

interface AdminLayoutShellProps {
    children: React.ReactNode;
    schoolName: string;
    schoolLogo: string | null;
}

export default function AdminLayoutShell({
    children,
    schoolName,
    schoolLogo
}: AdminLayoutShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-sans text-slate-900 dark:text-white">
            {/* Sidebar */}
            <AdminSidebar
                schoolName={schoolName}
                schoolLogo={schoolLogo}
                isCollapsed={isCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-y-auto relative w-full transition-all duration-300">
                {/* Header */}
                <header className="w-full px-6 py-3.5 bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-20">
                    <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            {/* Toggle Button */}
                            <button
                                onClick={() => {
                                    if (window.innerWidth >= 1024) {
                                        setIsCollapsed(!isCollapsed);
                                    } else {
                                        setIsMobileOpen(!isMobileOpen);
                                    }
                                }}
                                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>

                            <div className="flex flex-col gap-0.5">
                                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight">
                                    Overview PPDB
                                </h2>
                                <p className="text-slate-400 text-[10px] font-bold leading-none">
                                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
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
