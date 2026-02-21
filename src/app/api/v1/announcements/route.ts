import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const announcements = await db.announcement.findMany({
            where: {
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return NextResponse.json({ announcements });

    } catch (error) {
        console.error("API Announcements Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server" },
            { status: 500 }
        );
    }
}
