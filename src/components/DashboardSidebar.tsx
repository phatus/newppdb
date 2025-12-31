"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface SidebarProps {
    user: {
        name: string;
        email: string;
        role: string;
        image?: string | null;
    };
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { name: "Data Diri", href: "/dashboard/student/add", icon: "person" },
        { name: "Dokumen", href: "/dashboard/student/documents", icon: "description" },
        { name: "Pengumuman", href: "#", icon: "campaign" },
        { name: "Bantuan", href: "#", icon: "help" },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <>
            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Header Toggle (to be placed in layout, or we can handle it here if we wrap everything) 
                Actually, the layout usually holds the mobile header. 
                Let's assume the Layout handles the mobile button, or we export a separate MobileHeader. 
                For now, this is just the Sidebar. 
            */}

            <aside className={`fixed top-0 left-0 z-50 h-screen w-72 flex-col border-r border-slate-200 bg-white dark:bg-[#1c2936] dark:border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:flex ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="flex h-full flex-col justify-between p-6">
                    <div className="flex flex-col gap-6">
                        {/* User Profile */}
                        <div className="flex items-center gap-3 pb-6 border-b border-slate-100 dark:border-slate-700">
                            <div className="relative size-12 rounded-full overflow-hidden shadow-sm ring-2 ring-slate-100 dark:ring-slate-700">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <h1 className="text-slate-900 dark:text-white text-base font-bold leading-tight truncate">{user.name}</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">{user.role}</p>
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

            {/* Mobile Menu Button - Portal or direct render? 
                Ideally this should be in the Header of the main content.
                We'll export a separate trigger or handle it via a shared context/layout properly.
                For simplicity in this refactor, I'll pass a "Toggle" to the layout or let Layout handle the state.
                Actually, separating them is hard without Context. 
                Let's put the Sidebar AND the Mobile Header inside the same Client Component wrapper 'DashboardShell'.
            */}
        </>
    );
}
