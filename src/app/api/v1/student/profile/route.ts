import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request, session: any) {
    try {
        const student = await db.student.findFirst({
            where: {
                userId: session.id
            },
            include: {
                documents: true,
                grades: true,
                wave: true,
            }
        });

        return NextResponse.json({
            user: {
                id: session.id,
                email: session.email,
                name: session.name,
                role: session.role,
            },
            student: student || null
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
