import { db } from "@/lib/db";
import { getRankingData } from "@/app/actions/ranking";
import LiveRankingTable from "@/components/public/LiveRankingTable";
import Image from "next/image";

// Revalidate every 0 seconds (always fresh) or short interval
export const dynamic = 'force-dynamic';

export default async function PublicRankingPage({
    searchParams,
}: {
    searchParams: Promise<{ waveId?: string }>;
}) {
    const resolvedParams = await searchParams;
    const waveId = resolvedParams?.waveId;

    const { students } = await getRankingData({ waveId, isPublic: true });
    const settings = await db.schoolSettings.findFirst();
    const waves = await db.wave.findMany({
        orderBy: { startDate: 'asc' }
    });

    const selectedWave = waveId ? waves.find(w => w.id === waveId) : null;
    
    // Determine visibility based on wave or global settings
    const isResultsPublished = selectedWave 
        ? (selectedWave as any).isResultsPublished 
        : (settings as any)?.isResultsPublished ?? false;
        
    const showRankingScores = selectedWave 
        ? (selectedWave as any).showRanking 
        : (settings as any)?.showRankingScores ?? true;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-br from-blue-600 to-indigo-800 z-0"></div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] z-0"></div>

            <main className="relative z-10 max-w-[1600px] mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center mb-10 text-white">
                    {settings?.schoolLogo && (
                        <div className="w-24 h-24 bg-white rounded-full p-2 shadow-xl mb-4">
                            <Image
                                src={settings.schoolLogo}
                                alt="Logo Sekolah"
                                width={96}
                                height={96}
                                className="w-full h-full object-contain"
                            />
                        </div>
                    )}
                    <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">
                        LIVE SCORE PERANGKINGAN
                    </h1>
                    <p className="text-blue-100 text-lg md:text-xl font-medium">
                        PMBM {settings?.schoolName || "Sekolah"} Tahun {settings?.academicYear || "2025/2026"}
                    </p>
                </div>

                {/* Ranking Card */}
                <div className="w-full mx-auto">
                    <LiveRankingTable
                        initialData={students}
                        waves={waves}
                        initialWaveId={waveId}
                        isResultsPublished={isResultsPublished}
                        showRankingScores={showRankingScores}
                        isRankingLive={(settings as any)?.isRankingLive ?? true}
                    />
                </div>
            </main>
        </div>
    );
}
