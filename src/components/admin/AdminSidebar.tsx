"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LogoutButton from "@/components/LogoutButton";

interface AdminSidebarProps {
    schoolName: string;
    schoolLogo: string | null;
    isCollapsed: boolean;
    isMobileOpen: boolean;
    setIsMobileOpen: (open: boolean) => void;
}

export default function AdminSidebar({
    schoolName,
    schoolLogo,
    isCollapsed,
    isMobileOpen,
    setIsMobileOpen
}: AdminSidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path || pathname?.startsWith(path + "/");
    };

    const menuGroups = [
        {
            title: "Main",
            items: [
                { href: "/admin/dashboard", icon: "dashboard", label: "Dashboard" },
            ]
        },
        {
            title: "Manajemen PMBM",
            items: [
                { href: "/admin/students", icon: "group", label: "Pendaftar" },
                { href: "/admin/verification", icon: "fact_check", label: "Verifikasi", badge: true },
                { href: "/admin/schedule", icon: "calendar_month", label: "Jadwal Ujian" },
                { href: "/admin/grades", icon: "edit_note", label: "Olah Nilai" },
                { href: "/admin/ranking", icon: "leaderboard", label: "Rangking" },
                { href: "/admin/document-validation", icon: "qr_code_scanner", label: "Validasi Dokumen" },
            ]
        },
        {
            title: "Data & Info",
            items: [
                { href: "/admin/subjects", icon: "menu_book", label: "Mata Pelajaran" },
                { href: "/admin/announcements", icon: "campaign", label: "Pengumuman" },
            ]
        },
        {
            title: "Laporan & Sistem",
            items: [
                { href: "/admin/reports/emis", icon: "cloud_download", label: "Export EMIS" },
                { href: "/admin/reports", icon: "print", label: "Laporan" },
                { href: "/admin/email-monitor", icon: "mail", label: "Email Monitor" },
                { href: "/admin/logs", icon: "history", label: "Audit Log" },
                { href: "/admin/accounts", icon: "manage_accounts", label: "Manajemen Akun" },
                { href: "/admin/settings/waves", icon: "alt_route", label: "Gelombang" },
                { href: "/admin/settings", icon: "settings", label: "Pengaturan" },
            ]
        }
    ];

    // State for collapsible groups
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    useEffect(() => {
        // Initialize open groups based on current path
        const activeGroup = menuGroups.find(group =>
            group.items.some(item => isActive(item.href))
        );
        if (activeGroup) {
            setOpenGroups(prev => [...prev, activeGroup.title]);
        } else {
            // Default open Main and PPDB
            setOpenGroups(["Main", "Manajemen PMBM"]);
        }
    }, []); // Run once on mount

    const toggleGroup = (title: string) => {
        setOpenGroups(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const sidebarWidthClass = isCollapsed ? "lg:w-[70px]" : "lg:w-64";

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`
                    fixed lg:static inset-y-0 left-0 z-50
                    flex flex-col bg-white dark:bg-[#1e293b] border-r border-slate-200 dark:border-slate-700/50 h-full overflow-y-auto transition-all duration-300
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
                    ${sidebarWidthClass}
                    w-64 lg:w-auto
                `}
            >
                <div className={`p-4 flex flex-col h-full justify-between ${isCollapsed ? "px-2" : ""}`}>
                    <div className="flex flex-col gap-6">
                        {/* User Profile / Brand */}
                        <div className={`flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800/50 ${isCollapsed ? "justify-center px-0" : "px-1.5"}`}>
                            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center">
                                {schoolLogo ? (
                                    <img src={schoolLogo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined absolute text-slate-500">school</span>
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col overflow-hidden transition-opacity duration-300">
                                    <h1 className="text-slate-900 dark:text-white text-xs font-bold leading-tight truncate" title={schoolName}>
                                        {schoolName}
                                    </h1>
                                    <p className="text-slate-400 text-[10px] font-bold truncate">
                                        PMBM Administrator
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Links Grouped */}
                        <nav className="flex flex-col gap-2">
                            {menuGroups.map((group, groupIdx) => {
                                const isOpen = openGroups.includes(group.title) || isCollapsed; // Always open if collapsed to show icons

                                return (
                                    <div key={groupIdx} className="flex flex-col">
                                        {!isCollapsed && (
                                            <button
                                                onClick={() => toggleGroup(group.title)}
                                                className="px-3 py-2 flex items-center justify-between text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors group"
                                            >
                                                <h3 className="text-[10px] font-bold uppercase tracking-wider">
                                                    {group.title}
                                                </h3>
                                                <span className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                                    expand_more
                                                </span>
                                            </button>
                                        )}

                                        <div className={`flex flex-col gap-1.5 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            {group.items.map((link) => {
                                                const active = isActive(link.href);
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        onClick={() => setIsMobileOpen(false)}
                                                        className={`
                                                            flex items-center gap-3 px-3 py-2 rounded-xl transition-all border border-transparent
                                                            ${active
                                                                ? "bg-primary/10 text-primary hover:bg-primary/20"
                                                                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-primary"
                                                            }
                                                            ${isCollapsed ? "justify-center px-0" : ""}
                                                        `}
                                                        title={isCollapsed ? link.label : undefined}
                                                    >
                                                        <div className="relative flex items-center justify-center">
                                                            <span className={`material-symbols-outlined text-[20px] ${active ? "icon-filled" : ""}`}>
                                                                {link.icon}
                                                            </span>
                                                            {link.href === "/admin/verification" && (link as any).badge && !isCollapsed && (
                                                                <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-white dark:ring-[#1e293b]"></span>
                                                            )}
                                                        </div>

                                                        {!isCollapsed && (
                                                            <span className="text-xs font-bold truncate">
                                                                {link.label}
                                                            </span>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Bottom Action */}
                    <div className={`flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-700 ${isCollapsed ? "items-center" : ""}`}>
                        <div className={isCollapsed ? "w-8 overflow-hidden" : "w-full"}>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
