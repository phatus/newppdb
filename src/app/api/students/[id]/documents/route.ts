import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const resolvedParams = await params;
        const studentId = resolvedParams.id;

        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Validate body keys
        const allowedKeys = ["fileAkta", "fileKK", "fileSKL", "fileRaport", "pasFoto"];
        const updates: any = {};

        for (const key of allowedKeys) {
            if (body[key] !== undefined) {
                updates[key] = body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ message: "No valid fields to update" }, { status: 400 });
        }

        // Check verification status
        const student = await db.student.findUnique({
            where: { id: studentId, userId: session.user.id },
            include: { documents: true }
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        // Create or update documents
        const documents = await db.documents.upsert({
            where: { studentId },
            create: {
                studentId,
                ...updates
            },
            update: updates,
        });

        return NextResponse.json({ message: "Documents updated", documents }, { status: 200 });

    } catch (error) {
        console.error("Update documents error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
