"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { JalurPendaftaran } from "@prisma/client";
import { logActivity } from "@/lib/audit";
import { getNextWave } from "./waves";

export async function moveToNextStage(studentId: string, targetJalur: JalurPendaftaran = "REGULER") {
    try {
        // 1. Get the current student
        const student = await db.student.findUnique({
            where: { id: studentId },
            include: { wave: true }
        });

        if (!student) {
            return { success: false, error: "Data siswa tidak ditemukan." };
        }

        // 2. Find the next available wave
        const nextWave = await getNextWave(student.waveId);

        if (!nextWave) {
            return { success: false, error: "Tidak ada gelombang pendaftaran selanjutnya yang tersedia saat ini." };
        }

        // Check if the target jalur is allowed in the next wave
        const allowed = Array.isArray(nextWave.jalurAllowed) ? nextWave.jalurAllowed : [];
        if (!allowed.includes(targetJalur as any)) {
            return { success: false, error: `Jalur ${targetJalur} tidak tersedia di ${nextWave.name}.` };
        }

        // 3. Log history before reset
        await db.registrationHistory.create({
            data: {
                studentId,
                waveId: student.waveId,
                jalur: student.jalur,
                status: student.statusKelulusan,
                notes: "Pindah ke " + nextWave.name + " (" + targetJalur + ")"
            }
        });

        // 4. Update the student: Reset status, set new jalur, and update waveId
        await db.student.update({
            where: { id: studentId },
            data: {
                jalur: targetJalur,
                statusKelulusan: "PENDING",
                waveId: nextWave.id,
            }
        });

        await logActivity("MOVE_STAGE", "STUDENT", studentId, `Moved student to ${targetJalur} in ${nextWave.name}`);

        revalidatePath("/dashboard");
        revalidatePath("/admin/ranking");

        return { success: true, message: `Berhasil daftar ke ${nextWave.name} Jalur ${targetJalur}.` };

    } catch (error) {
        console.error("Error moving to next stage:", error);
        return { success: false, error: "Gagal memproses perpindahan gelombang." };
    }
}
