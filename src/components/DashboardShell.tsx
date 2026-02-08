"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";

interface DashboardShellProps {
    children: React.ReactNode;
    user: {
        name: string;
        email: string;
        role: string;
        image?: string | null;
    };
}

export default function DashboardShell({ children, user }: DashboardShellProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { name: "Dokumen", href: "/dashboard/student/documents", icon: "description" },
        { name: "Pengumuman", href: "/dashboard/announcements", icon: "campaign" },
        { name: "Bantuan", href: "/dashboard/help", icon: "help" },
    ];


    const isActive = (path: string) => pathname === path;

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            {/* Sidebar Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-screen flex-col border-r border-slate-200 bg-white dark:bg-[#1e293b] dark:border-slate-800/50 transition-all duration-300 lg:static lg:flex ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"} ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} print:hidden shadow-xl lg:shadow-none`}>
                <div className="flex h-full flex-col justify-between p-4">
                    <div className="flex flex-col gap-5">
                        {/* Profile */}
                        <div className={`flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-700/50 ${isSidebarCollapsed ? "justify-center" : ""}`}>
                            <div className="relative size-10 rounded-full overflow-hidden shadow-sm ring-2 ring-slate-100 dark:ring-slate-700/50 bg-slate-200 dark:bg-slate-700 shrink-0">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                    </div>
                                )}
                            </div>
                            {!isSidebarCollapsed && (
                                <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
                                    <h1 className="text-slate-900 dark:text-white text-xs font-bold leading-tight truncate w-32">{user.name}</h1>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold truncate">{user.role}</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group border border-transparent ${isActive(item.href)
                                        ? "bg-primary text-white shadow-md shadow-primary/20 border-primary"
                                        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5 hover:text-primary"
                                        } ${isSidebarCollapsed ? "justify-center" : ""}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    title={isSidebarCollapsed ? item.name : undefined}
                                >
                                    <span className={`material-symbols-outlined text-[20px] transition-colors`}>
                                        {item.icon}
                                    </span>
                                    {!isSidebarCollapsed && (
                                        <p className={`text-xs font-bold uppercase tracking-wide leading-normal animate-in fade-in duration-300`}>
                                            {item.name}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => signOut({ callbackUrl: "https://pmbm.mtsn1pacitan.sch.id" })}
                        className={`flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-[11px] font-bold leading-normal transition-all ${isSidebarCollapsed ? "px-0" : ""}`}
                        title={isSidebarCollapsed ? "Keluar Sesi" : undefined}
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        {!isSidebarCollapsed && <span className="truncate animate-in fade-in duration-300">Keluar Sesi</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-background-light dark:bg-[#101a22] relative print:overflow-visible print:h-auto print:bg-white transition-colors">
                <div className="flex flex-col w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 gap-6 print:p-0 print:max-w-none">
                    {/* Header: Hamburger (Mobile) & Toggle (Desktop) */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
                        <div className="flex items-center gap-4">
                            {/* Mobile Hamburger */}
                            <button
                                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <span className="material-symbols-outlined">menu</span>
                            </button>

                            {/* Desktop Sidebar Toggle */}
                            <button
                                className="hidden lg:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                <span className="material-symbols-outlined">
                                    {isSidebarCollapsed ? "dock_to_right" : "dock_to_left"}
                                </span>
                            </button>

                            <h1 className="lg:hidden text-xl font-black text-primary">SPMB Online</h1>
                        </div>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
