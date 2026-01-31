"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { JalurPendaftaran } from "@prisma/client";
import { logActivity } from "@/lib/audit";

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

        // 2. Find any active wave that is different from the current one
        const now = new Date();
        const activeWaves = await db.wave.findMany({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now },
                id: student.waveId ? { not: student.waveId } : undefined
            }
        });

        // Filter active waves that allow the target jalur (filtering in JS for JSON safety)
        const nextWave = activeWaves.find(w => {
            const allowed = Array.isArray(w.jalurAllowed) ? w.jalurAllowed : [];
            return allowed.includes(targetJalur);
        });

        if (!nextWave) {
            return { success: false, error: "Tidak ada gelombang aktif lainnya yang tersedia saat ini." };
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
