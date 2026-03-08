"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getActiveWave, getNextWave } from "./waves";

export async function reRegisterStudent(studentId: string, data: { newJalur: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { success: false, error: "Unauthorized" };

        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });

        if (!student) {
            return { success: false, error: "Murid tidak ditemukan" };
        }

        // Verify ownership (or admin)
        if (session.user.role !== "ADMIN" && student.userId !== session.user.id) {
            return { success: false, error: "Forbidden" };
        }

        // Check current status - MUST be TIDAK_LULUS to re-register
        if (student.statusKelulusan !== "TIDAK_LULUS") {
            return { success: false, error: "Anda hanya bisa mendaftar ulang jika dinyatakan Tidak Lulus." };
        }

        // Check Active Wave - Use a more permissive check for re-registration
        // We look for a wave that is marked active, even if it hasn't technically started yet.
        const targetWave = await getNextWave(student.waveId);

        if (!targetWave) {
            return { success: false, error: "Tidak ada gelombang pendaftaran selanjutnya yang dibuka saat ini." };
        }

        // Check if new jalur is allowed in the target wave
        if (targetWave.jalurAllowed && Array.isArray(targetWave.jalurAllowed)) {
            if (!targetWave.jalurAllowed.includes(data.newJalur)) {
                return { success: false, error: `Jalur ${data.newJalur} tidak dibuka pada gelombang ini.` };
            }
        }

        // TRANSACTION: Archive History & Update Student
        await db.$transaction(async (tx) => {
            // 1. Create History Record
            await tx.registrationHistory.create({
                data: {
                    studentId: student.id,
                    waveId: student.waveId,
                    jalur: student.jalur,
                    status: student.statusKelulusan, // Should be TIDAK_LULUS
                    notes: `Re-registered to ${data.newJalur} on Wave ${targetWave.name}`
                }
            });

            // 2. Update Student Record
            // Note: We use executeRaw for Enums if needed, but standard update is safer if types align.
            // Jalur is an Enum, so standard update expects the Enum type.
            await tx.student.update({
                where: { id: student.id },
                data: {
                    waveId: targetWave.id,
                    jalur: data.newJalur as any,
                    statusKelulusan: "PENDING",
                    catatanPenolakan: null,
                }
            });

            // 3. Reset Document Verification Statuses to PENDING?
            // Optional: If you want admin to re-check everything. 
            // Let's reset document statuses to PENDING so they show up in verification list again.
            // But documents might be okay. Better to set student statusVerifikasi to PENDING (done above).
            // Admin will see "PENDING" student and check their docs.
        });

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/student/documents`);

        return { success: true };

    } catch (error: any) {
        console.error("Re-registration error:", error);
        return { success: false, error: error.message || "Gagal melakukan pendaftaran ulang." };
    }
}
