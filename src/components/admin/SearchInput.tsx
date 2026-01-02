"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useRef } from "react";

export default function SearchInput() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
                type="text"
                placeholder="Cari nama atau NISN..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                defaultValue={searchParams.get("q")?.toString()}
                onChange={(e) => {
                    const value = e.target.value;
                    if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                    }
                    debounceTimeoutRef.current = setTimeout(() => handleSearch(value), 500);
                }}
            />
            {isPending && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}
