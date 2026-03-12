import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const jalur = searchParams.get("jalur");
        const waveId = searchParams.get("waveId");

        const where: any = {
            statusVerifikasi: "VERIFIED"
        };

        if (jalur) where.jalur = jalur;
        if (waveId) where.waveId = waveId;

        const settings = await db.schoolSettings.findFirst();
        const isResultsPublished = (settings as any)?.isResultsPublished ?? false;

        const rankings = await db.student.findMany({
            where,
            select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                jalur: true,
                statusKelulusan: true,
                grades: {
                    select: {
                        finalScore: true,
                        rataRataNilai: true,
                    }
                },
            },
            orderBy: {
                grades: { finalScore: 'desc' },
            },
            take: 100 // Limit for public ranking
        });

        // Obfuscate results if not published
        const safeRankings = rankings.map(r => ({
            ...r,
            statusKelulusan: isResultsPublished ? r.statusKelulusan : "PENDING"
        }));

        return NextResponse.json({ rankings: safeRankings });

    } catch (error) {
        console.error("API Ranking Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
