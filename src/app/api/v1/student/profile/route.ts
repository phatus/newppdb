import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request, session: any) {
    try {
        // Lookup user by email to get the stable DB ID (prevents mismatch with token ID)
        const user = await db.user.findUnique({
            where: { email: session.email }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const students = await db.student.findMany({
            where: {
                userId: user.id
            },
            include: {
                documents: true,
                grades: true,
                wave: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
            students: students
        });

    } catch (error) {
        console.error("API Profile Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    return withAuth(req, handler);
}
