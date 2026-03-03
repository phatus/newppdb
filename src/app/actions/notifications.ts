"use server";

import { db } from "@/lib/db";
import { getRankingData } from "./ranking";
import { sendWhatsApp } from "@/lib/whatsapp";
import { logActivity } from "@/lib/audit";

export async function blastFinalStatus(quota: number) {
    try {
        const { students } = await getRankingData();
        const settings = await db.schoolSettings.findFirst();

        if (!settings?.isWaEnabled) {
            return { success: false, error: "WA Gateway dinonaktifkan." };
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const isAccepted = i < quota;
            const phone = student.telepon;
            const statusKelulusan = isAccepted ? "LULUS" : "TIDAK_LULUS";

            // Persist status to database
            await db.student.update({
                where: { id: student.id },
                data: { statusKelulusan }
            });

            if (!phone) {
                failCount++;
                continue;
            }

            const statusText = isAccepted ? "DITERIMA" : "TIDAK DITERIMA";
            const message = `Halo ${student.namaLengkap},\n\nBerdasarkan hasil seleksi akhir PMBM ${settings.schoolName || "SDIT Insan Kamil"}, Anda dinyatakan:\n\n*${statusText}*\n\nTerima kasih telah berpartisipasi dalam proses pendaftaran ini.`;

            const res = await sendWhatsApp(phone, message);
            if (res.success) successCount++;
            else failCount++;
        }

        await logActivity("BLAST_WA", "STUDENT", "ALL", `Quota: ${quota}, Success: ${successCount}, Fail: ${failCount}`);

        return { success: true, successCount, failCount };

    } catch (error) {
        console.error("Error blasting WA:", error);
        return { success: false, error: "Terjadi kesalahan saat mengirim pesan." };
    }
}

export async function sendManualWA(studentId: string, message: string) {
    try {
        const student = await db.student.findUnique({
            where: { id: studentId },
            select: { telepon: true, namaLengkap: true }
        });

        if (!student?.telepon) {
            return { success: false, error: "Nomor telepon siswa tidak ditemukan." };
        }

        const res = await sendWhatsApp(student.telepon, message);

        if (res.success) {
            await logActivity("SEND_WA_MANUAL", "STUDENT", studentId, `Message: ${message.substring(0, 50)}...`);
            return { success: true };
        } else {
            return { success: false, error: "Gagal mengirim pesan melalui gateway." };
        }
    } catch (error: any) {
        console.error("Error sending manual WA:", error);
        return { success: false, error: error.message || "Terjadi kesalahan sistem." };
    }
}
