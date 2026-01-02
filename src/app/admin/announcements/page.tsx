import { getAnnouncements } from "@/app/actions/announcements";
import AnnouncementManager from "@/components/admin/AnnouncementManager";
import { Suspense } from "react";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements(true); // isAdmin=true to see all

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
        </div>
    );
}
