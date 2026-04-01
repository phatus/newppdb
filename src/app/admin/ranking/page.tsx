export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { getRankingData } from "@/app/actions/ranking";
import RankingTable from "@/components/admin/RankingTable";
import WABlastPanel from "@/components/admin/WABlastPanel";
import RankingControlPanel from "@/components/admin/ranking/RankingControlPanel";

const PAGE_SIZE = 20;

export default async function RankingPage({
    searchParams,
}: {
    searchParams: Promise<{ waveId?: string; jalur?: string; page?: string }>;
}) {
    const resolvedParams = await searchParams;
    const waveId = resolvedParams?.waveId;
    const jalur = resolvedParams?.jalur as any;
    const currentPage = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    const { students, totalCount } = await getRankingData({ waveId, jalur, forceLive: true }, skip, PAGE_SIZE);
    const settings = await db.schoolSettings.findFirst();
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'asc' }
    });

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Perangkingan Murid</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Daftar peringkat berdasarkan kalkulasi nilai Rapor, Ujian Teori, SKUA, dan Prestasi.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <WABlastPanel />
                </div>
            </div>

            <RankingControlPanel 
                isRankingLive={(settings as any)?.isRankingLive ?? true}
                showRankingScores={(settings as any)?.showRankingScores ?? true}
            />

            <div className="bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <span>
                            Kalkulasi skor akhir menggunakan pembobotan spesifik sesuai <strong>Jalur Pendaftaran</strong>. Anda dapat menyesuaikan bobot (%) di menu <a href="/admin/settings#ranking" className="text-primary hover:underline font-bold">Pengaturan</a>.
                        </span>
                    </div>
                </div>

                <RankingTable
                    initialData={students}
                    waves={waves}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    itemsPerPage={PAGE_SIZE}
                    initialWaveId={waveId}
                    initialJalur={jalur}
                />
            </div>
        </div>
    );
}
