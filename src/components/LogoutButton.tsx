"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
    className?: string;
    iconClassName?: string;
    textClassName?: string;
    showText?: boolean;
}

export default function LogoutButton({
    className = "flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left",
    iconClassName = "material-symbols-outlined",
    textClassName = "text-sm font-medium",
    showText = true,
}: LogoutButtonProps) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: "https://pmbm.mtsn1pacitan.sch.id" })}
            className={className}
        >
            <span className={iconClassName}>logout</span>
            {showText && <span className={textClassName}>Keluar</span>}
        </button>
    );
}
