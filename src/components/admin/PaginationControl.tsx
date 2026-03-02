"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface PaginationControlProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export default function PaginationControl({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
}: PaginationControlProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createPageURL = useCallback(
        (page: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", page.toString());
            return `${pathname}?${params.toString()}`;
        },
        [pathname, searchParams]
    );

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        router.push(createPageURL(page));
    };

    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display (max 5 visible)
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
            {/* Info */}
            <p className="text-sm text-slate-500 dark:text-slate-400 shrink-0">
                Menampilkan{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {startItem}–{endItem}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {totalItems}
                </span>{" "}
                data
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Prev */}
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Halaman sebelumnya"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                {/* Page Numbers */}
                {pageNumbers.map((page, idx) =>
                    page === "..." ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 text-sm"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => goToPage(page as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                    ? "bg-primary text-white shadow-sm"
                                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                }`}
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </button>
                    )
                )}

                {/* Next */}
                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Halaman berikutnya"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        </div>
    );
}
