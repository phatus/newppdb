"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Student, Grades, Documents, SchoolSettings, VerificationStatus, JalurPendaftaran } from "@prisma/client";

// Define the shape of student with included relations
type StudentWithRelations = Student & {
    grades: Grades | null;
    documents: Documents | null;
};

// Define the shape of student with calculated final score
type RankedStudent = StudentWithRelations & {
    grades: (Grades & { finalScore: number }) | null;
};

export async function getRankingData(filters?: { waveId?: string; jalur?: JalurPendaftaran }): Promise<RankedStudent[]> {
    try {
        // 1. Fetch Students who are verified
        const where: any = { statusVerifikasi: "VERIFIED" };
        if (filters?.waveId) where.waveId = filters.waveId;
        if (filters?.jalur) where.jalur = filters.jalur;

        const students = await db.student.findMany({
            where,
            include: {
                grades: true,
                documents: true, // Needed to check achievements
            }
        });

        // 2. Fetch Settings for Weights
        const settings = await db.schoolSettings.findFirst();

        // Smart Defaults for each Path (sum to 100%)
        const pathDefaults: Record<string, any> = {
            "REGULER": { rapor: 0, ujian: 50, skua: 50, prestasi: 0 },
            "AFIRMASI": { rapor: 0, ujian: 50, skua: 50, prestasi: 0 },
            "PRESTASI_AKADEMIK": { rapor: 30, ujian: 30, skua: 30, prestasi: 10 },
            "PRESTASI_NON_AKADEMIK": { rapor: 0, ujian: 30, skua: 30, prestasi: 40 },
        };

        // 3. Process Scores
        const rankedStudents: RankedStudent[] = students.map((student) => {
            const grades = student.grades;

            // Determine Weights (Path-Specific or Smart Defaults)
            const pathWeights = ((settings as any)?.pathWeights as Record<string, any>) || {};
            const specificWeights = pathWeights[student.jalur];

            const defaultW = pathDefaults[student.jalur] || {
                rapor: (settings as any)?.weightRapor ?? 40,
                ujian: (settings as any)?.weightUjian ?? 30,
                skua: (settings as any)?.weightSKUA ?? 30,
                prestasi: 0
            };

            // Normalize weights to 0-1 range
            const wRapor = (specificWeights?.rapor ?? defaultW.rapor) / 100;
            const wUjian = (specificWeights?.ujian ?? defaultW.ujian) / 100;
            const wSKUA = (specificWeights?.skua ?? defaultW.skua) / 100;
            // Achievement is now additive, not weighted
            // const wPrestasi = (specificWeights?.prestasi ?? defaultW.prestasi) / 100;

            const avgReport = grades?.rataRataNilai || 0;
            const theory = grades?.nilaiUjianTeori || 0;
            const skua = grades?.nilaiUjianSKUA || 0;
            const achievement = grades?.nilaiPrestasi || 0;

            // Calculate Final Score: (Weights * Values) + Achievement Bonus
            let finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
            finalScore = parseFloat(finalScore.toFixed(2));

            return {
                ...student,
                grades: grades ? {
                    ...grades,
                    finalScore
                } : null
            } as RankedStudent;
        });

        // 4. Sort by Final Score DESC
        rankedStudents.sort((a, b) => {
            const scoreA = a.grades?.finalScore || 0;
            const scoreB = b.grades?.finalScore || 0;
            return scoreB - scoreA;
        });

        return rankedStudents;

    } catch (error) {
        console.error("Error fetching ranking:", error);
        return [];
    }
}

interface UpdateScoreData {
    theory?: number;
    skua?: number;
    achievement?: number;
}

export async function updateStudentScore(studentId: string, data: UpdateScoreData) {
    try {
        await db.grades.upsert({
            where: { studentId },
            create: {
                studentId,
                nilaiUjianTeori: data.theory,
                nilaiUjianSKUA: data.skua,
                nilaiPrestasi: data.achievement
            },
            update: {
                nilaiUjianTeori: data.theory,
                nilaiUjianSKUA: data.skua,
                nilaiPrestasi: data.achievement
            }
        });

        revalidatePath("/admin/ranking");
        revalidatePath("/admin/grades");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal update nilai" };
    }
}

export async function autoSelectStudents(filters?: { waveId?: string; jalur?: JalurPendaftaran }) {
    try {
        // 1. Get Quota and Settings
        const settingsRaw = await db.$queryRaw<SchoolSettings[]>`SELECT * FROM "SchoolSettings" LIMIT 1`;
        const settings = settingsRaw[0] || {};

        // Quotas
        const quotaReguler = settings.quotaReguler || 50;
        const quotaPrestasiAkademik = settings.quotaPrestasiAkademik || 15;
        const quotaPrestasiNonAkademik = settings.quotaPrestasiNonAkademik || 15;
        const quotaAfirmasi = settings.quotaAfirmasi || 20;

        // 2. Get Verified Students with Ranking Data based on filters
        const allStudents = await getRankingData(filters);

        if (allStudents.length === 0) {
            return { success: false, error: "Tidak ada data murid terverifikasi pada filter ini." };
        }

        // 3. Project-specific selection logic
        // If filters.jalur is set, we only process that specific path
        const jalurToProcess = filters?.jalur ? [filters.jalur] : ["REGULER", "PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK", "AFIRMASI"];

        let passedCount = 0;
        let totalCount = 0;

        const passedIds: string[] = [];
        const failedIds: string[] = [];

        // Helper to process a group
        const processGroup = (students: RankedStudent[], quota: number) => {
            const passed = students.slice(0, quota);
            const failed = students.slice(quota);
            passedIds.push(...passed.map(s => s.id));
            failedIds.push(...failed.map(s => s.id));
            return passed.length;
        };

        if (jalurToProcess.includes("REGULER")) {
            const group = allStudents.filter(s => s.jalur === "REGULER");
            passedCount += processGroup(group, quotaReguler);
        }
        if (jalurToProcess.includes("PRESTASI_AKADEMIK")) {
            const group = allStudents.filter(s => s.jalur === "PRESTASI_AKADEMIK");
            passedCount += processGroup(group, quotaPrestasiAkademik);
        }
        if (jalurToProcess.includes("PRESTASI_NON_AKADEMIK")) {
            const group = allStudents.filter(s => s.jalur === "PRESTASI_NON_AKADEMIK");
            passedCount += processGroup(group, quotaPrestasiNonAkademik);
        }
        if (jalurToProcess.includes("AFIRMASI")) {
            const group = allStudents.filter(s => s.jalur === "AFIRMASI");
            passedCount += processGroup(group, quotaAfirmasi);
        }

        // 5. Update Database
        if (passedIds.length > 0) {
            await db.student.updateMany({
                where: { id: { in: passedIds } },
                data: { statusKelulusan: "LULUS" }
            });
        }

        if (failedIds.length > 0) {
            await db.student.updateMany({
                where: { id: { in: failedIds } },
                data: { statusKelulusan: "TIDAK_LULUS" }
            });
        }

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `Seleksi otomatis selesai untuk filter yang dipilih.\n` +
                `Total Murid Diproses: ${allStudents.length}\n` +
                `Total Diterima: ${passedIds.length}`
        };

    } catch (error) {
        console.error("Auto selection error:", error);
        return { success: false, error: "Terjadi kesalahan saat seleksi otomatis." };
    }
}
