import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
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

        // Verify student belongs to user
        const student = await db.student.findUnique({
            where: {
                id: studentId,
                userId: session.user.id,
            },
            include: {
                documents: true,
            },
        });

        if (!student) {
            return NextResponse.json({ message: "Student not found" }, { status: 404 });
        }

        // Check documents (optional but good practice)
        if (!student.documents) {
            return NextResponse.json({ message: "Documents incomplete" }, { status: 400 });
        }

        // Update status to PENDING (if not already verified or rejected)
        // If already verified, maybe don't allow? Or allow re-submission?
        // Usually finalize means "Submit for review".

        if (student.statusVerifikasi === "VERIFIED") {
            return NextResponse.json({ message: "Already verified" }, { status: 400 });
        }

        const updatedStudent = await db.student.update({
            where: { id: studentId },
            data: {
                statusVerifikasi: "PENDING",
            },
        });

        return NextResponse.json({ message: "Finalized", student: updatedStudent }, { status: 200 });

    } catch (error) {
        console.error("Finalize error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
