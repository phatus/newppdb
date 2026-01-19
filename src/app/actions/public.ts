"use server";

import { db } from "@/lib/db";

export async function checkGraduationStatus(nisn: string) {
    if (!nisn) return { success: false, error: "NISN wajib diisi" };

    try {
        const student = await db.student.findFirst({
            where: {
                nisn: nisn,
                statusVerifikasi: "VERIFIED" // Only verified students should be checked
            },
            select: {
                namaLengkap: true,
                nisn: true,
                statusKelulusan: true,
                jalur: true
            }
        });

        if (!student) {
            return { success: false, error: "Data siswa tidak ditemukan atau belum diverifikasi." };
        }

        if (student.statusKelulusan === "PENDING" || !student.statusKelulusan) {
            return { success: false, error: "Pengumuman kelulusan belum tersedia untuk siswa ini." };
        }

        return {
            success: true,
            data: {
                nama: student.namaLengkap,
                nisn: student.nisn,
                status: student.statusKelulusan, // LULUS / TIDAK_LULUS
                jalur: student.jalur.replace(/_/g, " "),
            }
        };

    } catch (error) {
        console.error("Check graduation error:", error);
        return { success: false, error: "Terjadi kesalahan sistem" };
    }
}

export async function getQuotaStats() {
    try {
        // 1. Get Quota from Settings (Raw query to ensure fields exist)
        const settingsRaw: any[] = await db.$queryRaw`SELECT * FROM "SchoolSettings" LIMIT 1`;
        const settings = settingsRaw[0] || {};

        const quotaReguler = settings.quotaReguler || 0;
        const quotaPrestasiAkademik = settings.quotaPrestasiAkademik || 0;
        const quotaPrestasiNonAkademik = settings.quotaPrestasiNonAkademik || 0;
        const quotaAfirmasi = settings.quotaAfirmasi || 0;

        // 2. Count "LULUS" students grouped by Jalur
        const acceptedStats = await db.student.groupBy({
            by: ['jalur'],
            where: {
                statusKelulusan: 'LULUS'
            },
            _count: {
                _all: true
            }
        });

        // 3. Map counts
        let filledReguler = 0;
        let filledPrestasiAkademik = 0;
        let filledPrestasiNonAkademik = 0;
        let filledAfirmasi = 0;

        acceptedStats.forEach(stat => {
            const jalur = stat.jalur as string;
            if (jalur === 'REGULER') filledReguler = stat._count._all;
            if (jalur === 'PRESTASI_AKADEMIK') filledPrestasiAkademik = stat._count._all;
            if (jalur === 'PRESTASI_NON_AKADEMIK') filledPrestasiNonAkademik = stat._count._all;
            if (jalur === 'AFIRMASI') filledAfirmasi = stat._count._all;
        });

        return {
            success: true,
            data: [
                { label: "Jalur Reguler", quota: quotaReguler, filled: filledReguler, color: "blue" },
                { label: "Prestasi Akademik", quota: quotaPrestasiAkademik, filled: filledPrestasiAkademik, color: "amber" },
                { label: "Prestasi Non-Akademik", quota: quotaPrestasiNonAkademik, filled: filledPrestasiNonAkademik, color: "emerald" }, // Using emerald to differentiate, or maybe another shade
                { label: "Jalur Afirmasi", quota: quotaAfirmasi, filled: filledAfirmasi, color: "blue" } // Reusing colors since we only have 3 map entries in UI probably. Let's check UI map.
            ]
        };

    } catch (error) {
        console.error("Get quota stats error:", error);
        return { success: false, data: [] };
    }
}
