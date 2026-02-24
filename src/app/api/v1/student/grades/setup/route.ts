import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request) {
    try {
        const semesters = await db.semester.findMany({
            where: {
                isActive: true,
                NOT: {
                    name: { contains: "Kelas 6 Semester 2" }
                }
            },
            orderBy: { order: 'asc' }
        });

        const subjects = await db.subject.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json({ semesters, subjects });
    } catch (error) {
        console.error("Error fetching grade setup:", error);
        return NextResponse.json(
            { message: "Gagal memuat setup nilai" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    return withAuth(req, handler);
}
