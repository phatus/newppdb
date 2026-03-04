"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

/**
 * Claim a student for verification.
 * Sets the current admin as the verifier for this student.
 */
export async function claimStudent(studentId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await db.user.findUnique({ where: { email: session.user.email! } });
        if (!user) return { success: false, error: "User tidak ditemukan" };

        // Check if student is already claimed by someone else
        const student = await db.student.findUnique({
            where: { id: studentId },
            select: { verifierId: true, namaLengkap: true }
        });

        if (!student) {
            return { success: false, error: "Murid tidak ditemukan" };
        }

        if (student.verifierId && student.verifierId !== user.id) {
            // Already claimed by someone else
            const claimer = await db.user.findUnique({
                where: { id: student.verifierId },
                select: { name: true, email: true }
            });
            return {
                success: false,
                error: `Murid ini sedang diperiksa oleh ${claimer?.name || claimer?.email || "admin lain"}`
            };
        }

        await db.student.update({
            where: { id: studentId },
            data: { verifierId: user.id }
        });

        await logActivity("CLAIM_STUDENT", "STUDENT", studentId, `Claimed by ${user.name || user.email}`);

        revalidatePath("/admin/verification");
        revalidatePath(`/admin/verification/${studentId}`);

        return { success: true };
    } catch (error) {
        console.error("Error claiming student:", error);
        return { success: false, error: "Gagal mengambil data murid" };
    }
}

/**
 * Release a claimed student back to the shared pool.
 */
export async function releaseStudent(studentId: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const user = await db.user.findUnique({ where: { email: session.user.email! } });
        if (!user) return { success: false, error: "User tidak ditemukan" };

        const student = await db.student.findUnique({
            where: { id: studentId },
            select: { verifierId: true }
        });

        if (!student) {
            return { success: false, error: "Murid tidak ditemukan" };
        }

        // Only the claimer or any admin can release
        await db.student.update({
            where: { id: studentId },
            data: { verifierId: null }
        });

        await logActivity("RELEASE_STUDENT", "STUDENT", studentId, `Released by ${user.name || user.email}`);

        revalidatePath("/admin/verification");
        revalidatePath(`/admin/verification/${studentId}`);

        return { success: true };
    } catch (error) {
        console.error("Error releasing student:", error);
        return { success: false, error: "Gagal melepas murid" };
    }
}

/**
 * Update verification note for internal team communication.
 */
export async function updateVerificationNote(studentId: string, note: string) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.student.update({
            where: { id: studentId },
            data: { verificationNote: note }
        });

        revalidatePath(`/admin/verification/${studentId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating verification note:", error);
        return { success: false, error: "Gagal menyimpan catatan" };
    }
}
