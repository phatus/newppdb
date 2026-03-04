"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
    initialRole?: string;
    totalCount: number;
    adminCount: number;
    userCount: number;
}

export default function AccountRoleFilter({ initialRole, totalCount, adminCount, userCount }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (val: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val === "all") {
            params.delete("role");
        } else {
            params.set("role", val);
        }
        params.delete("page");
        router.push(`?${params.toString()}`);
    };

    const options = [
        { id: "all", name: "Semua", count: totalCount, color: "bg-slate-100 text-slate-600" },
        { id: "ADMIN", name: "Admin", count: adminCount, color: "bg-purple-100 text-purple-700" },
        { id: "USER", name: "User", count: userCount, color: "bg-blue-100 text-blue-700" },
    ];

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                Filter Role
            </span>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => handleChange(opt.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all h-[38px] flex items-center gap-2 ${(initialRole || "all") === opt.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                            }`}
                    >
                        {opt.name}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${(initialRole || "all") === opt.id
                                ? "bg-white/20 text-white"
                                : opt.color
                            }`}>
                            {opt.count}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
