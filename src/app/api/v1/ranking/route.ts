import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getRankingData } from "@/app/actions/ranking";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const jalur = searchParams.get("jalur");
        const waveId = searchParams.get("waveId");

        const where: any = {
            statusVerifikasi: "VERIFIED"
        };

        const { students: rankings } = await getRankingData({
            jalur: jalur as any,
            waveId: waveId as string
        });

        const settings = await db.schoolSettings.findFirst();
        const isResultsPublished = (settings as any)?.isResultsPublished ?? false;

        // Obfuscate results if not published
        const safeRankings = rankings.map((r: any) => ({
            id: r.id,
            namaLengkap: r.namaLengkap,
            nisn: r.nisn,
            jalur: r.jalur,
            statusKelulusan: isResultsPublished ? r.statusKelulusan : "PENDING",
            grades: {
                finalScore: r.grades?.finalScore || 0,
                rataRataNilai: (r.grades as any)?.rataRataNilai || 0
            }
        }));

        return NextResponse.json({ rankings: safeRankings });

    } catch (error) {
        console.error("API Ranking Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
