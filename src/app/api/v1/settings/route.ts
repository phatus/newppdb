import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const settings = await db.schoolSettings.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        const waves = await db.wave.findMany({
            where: { isActive: true },
            orderBy: { startDate: 'asc' }
        });

        const subjects = await db.subject.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        const semesters = await db.semester.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({
            settings,
            waves,
            subjects,
            semesters
        });

    } catch (error) {
        console.error("API Settings Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
