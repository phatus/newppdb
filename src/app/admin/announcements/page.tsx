import { getAnnouncements } from "@/app/actions/announcements";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import PaginationControl from "@/components/admin/PaginationControl";
import { Suspense } from "react";

const PAGE_SIZE = 10;

export default async function AnnouncementsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const resolvedParams = await searchParams;
    const currentPage = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    const { announcements, totalCount } = await getAnnouncements(true, skip, PAGE_SIZE);
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="p-6 w-full max-w-[1000px] mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Manajemen Pengumuman
                </h1>
                <p className="text-slate-500 text-sm">
                    Kelola informasi dan berita untuk pendaftar.
                </p>
            </div>

            <Suspense fallback={<div className="h-64 bg-slate-100 rounded-xl animate-pulse" />}>
                <AnnouncementManager announcements={announcements} />
            </Suspense>

            {/* Pagination Footer */}
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-center">
                <Suspense fallback={<div className="h-10 w-64 bg-slate-100 animate-pulse rounded-lg" />}>
                    <PaginationControl
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalCount}
                        itemsPerPage={PAGE_SIZE}
                    />
                </Suspense>
            </div>
        </div>
    );
}
