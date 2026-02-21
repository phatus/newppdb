import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request, session: any) {
    try {
        const body = await req.json();
        const { field, url } = body;

        if (!field || !url) {
            return NextResponse.json({ message: "Field and URL are required" }, { status: 400 });
        }

        const student = await db.student.findFirst({
            where: { userId: session.id }
        });

        if (!student) {
            return NextResponse.json({ message: "Student record not found" }, { status: 404 });
        }

        const updatedDocs = await db.documents.upsert({
            where: { studentId: student.id },
            update: { [field]: url, [`status${field.replace('file', '').replace('pas', 'Pas')}`]: 'PENDING' },
            create: {
                studentId: student.id,
                [field]: url,
            }
        });

        return NextResponse.json({
            message: "Document updated successfully",
            documents: updatedDocs
        });

    } catch (error) {
        console.error("API Update Documents Error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return withAuth(req, handler);
}

export async function GET(req: Request) {
    return withAuth(req, async (req, session) => {
        const student = await db.student.findFirst({
            where: { userId: session.id },
            include: { documents: true }
        });
        return NextResponse.json({ documents: student?.documents || null });
    });
}
