"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardAnalytics() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return null;

        // 1. Daily Registrations (Last 7 Days)
        // PostgreSQL specific: DATE_TRUNC('day', "createdAt")
        const dailyStats = await db.$queryRawUnsafe(`
            SELECT 
                TO_CHAR("createdAt", 'YYYY-MM-DD') as date,
                COUNT(*)::int as count
            FROM "Student"
            WHERE "createdAt" >= NOW() - INTERVAL '7 days'
            GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
            ORDER BY date ASC
        `) as any[];

        // 2. Jalur Distribution
        const jalurStats = await db.$queryRawUnsafe(`
            SELECT "jalur", COUNT(*)::int as count
            FROM "Student"
            GROUP BY "jalur"
        `) as any[];

        // 3. Status Distribution
        const statusStats = await db.$queryRawUnsafe(`
            SELECT "statusVerifikasi", COUNT(*)::int as count
            FROM "Student"
            GROUP BY "statusVerifikasi"
        `) as any[];

        // 4. Gender Stats (Optional)
        const genderStats = await db.$queryRawUnsafe(`
            SELECT "gender", COUNT(*)::int as count
            FROM "Student"
            GROUP BY "gender"
        `) as any[];

        return {
            daily: dailyStats.map(d => ({ date: d.date, count: Number(d.count) })),
            jalur: jalurStats.map(j => ({ name: j.jalur, value: Number(j.count) })),
            status: statusStats.map(s => ({ name: s.statusVerifikasi, value: Number(s.count) })),
            gender: genderStats.map(g => ({ name: g.gender || 'Unknown', value: Number(g.count) }))
        };

    } catch (error) {
        console.error("Error fetching analytics:", error);
        return {
            daily: [],
            jalur: [],
            status: [],
            gender: []
        };
    }
}
