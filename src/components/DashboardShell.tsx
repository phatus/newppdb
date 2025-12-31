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
    const pathname = usePathname();

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { name: "Data Diri", href: "/dashboard/student/add", icon: "person" },
        { name: "Dokumen", href: "/dashboard/student/documents", icon: "description" },
        { name: "Pengumuman", href: "#", icon: "campaign" },
        { name: "Bantuan", href: "#", icon: "help" },
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
            <aside className={`fixed top-0 left-0 z-50 h-screen w-72 flex-col border-r border-slate-200 bg-white dark:bg-[#1c2936] dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} print:hidden`}>
                <div className="flex h-full flex-col justify-between p-6">
                    <div className="flex flex-col gap-6">
                        {/* Profile */}
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative size-12 rounded-full overflow-hidden shadow-sm ring-2 ring-slate-100 dark:ring-slate-700 bg-slate-200 dark:bg-slate-700 shrink-0">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-tight truncate">{user.name}</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider truncate">{user.role}</p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors group ${isActive(item.href)
                                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                                        : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/5"
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className={`material-symbols-outlined text-[24px] transition-colors ${!isActive(item.href) && "group-hover:text-primary"}`}>
                                        {item.icon}
                                    </span>
                                    <p className={`text-sm font-medium leading-normal ${!isActive(item.href) && "group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                                        {item.name}
                                    </p>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span className="truncate">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto bg-background-light dark:bg-background-dark relative print:overflow-visible print:h-auto print:bg-white">
                <div className="flex flex-col w-full max-w-[1200px] mx-auto p-4 md:p-8 gap-8 print:p-0 print:max-w-none">
                    {/* Mobile Header (Hamburger) */}
                    <div className="lg:hidden flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 print:hidden">
                        <h1 className="text-xl font-black text-primary">PPDB Online</h1>
                        <button
                            className="p-2 text-slate-600 dark:text-slate-300"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>

                    {children}
                </div>
            </main>
        </div>
    );
}
