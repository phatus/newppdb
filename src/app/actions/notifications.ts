"use server";

import { db } from "@/lib/db";
import { getRankingData } from "./ranking";
import { sendWhatsApp } from "@/lib/whatsapp";
import { logActivity } from "@/lib/audit";

export async function blastFinalStatus(quota: number) {
    try {
        const students = await getRankingData();
        const settings: any = await db.schoolSettings.findFirst();

        if (!settings?.isWaEnabled) {
            return { success: false, error: "WA Gateway dinonaktifkan." };
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student: any = students[i];
            const isAccepted = i < quota;
            const phone = student.telepon;
            const statusKelulusan = isAccepted ? "LULUS" : "TIDAK_LULUS";

            // Persist status to database using Raw SQL due to stale Prisma Client
            await db.$executeRawUnsafe(`
                UPDATE "Student" 
                SET "statusKelulusan" = $1
                WHERE "id" = $2
            `, statusKelulusan, student.id);

            if (!phone) {
                failCount++;
                continue;
            }

            const statusText = isAccepted ? "DITERIMA" : "TIDAK DITERIMA";
            const message = `Halo ${student.namaLengkap},\n\nBerdasarkan hasil seleksi akhir PPDB ${settings.schoolName || "SDIT Insan Kamil"}, Anda dinyatakan:\n\n*${statusText}*\n\nTerima kasih telah berpartisipasi dalam proses pendaftaran ini.`;

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
