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

/**
 * Fetches and ranks student data with optional pagination and filters.
 * Returns an object containing the ranked students and total count.
 */
export async function getRankingData(filters?: { waveId?: string; jalur?: JalurPendaftaran }, skip?: number, take?: number): Promise<{ students: RankedStudent[], totalCount: number }> {
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
            "REGULER": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
            "AFIRMASI": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
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

        const totalCount = rankedStudents.length;
        const pagedStudents = (skip !== undefined && take !== undefined)
            ? rankedStudents.slice(skip, skip + take)
            : rankedStudents;

        return { students: pagedStudents, totalCount };

    } catch (error) {
        console.error("Error fetching ranking:", error);
        return { students: [], totalCount: 0 };
    }
}

interface UpdateScoreData {
    theory?: number;
    skua?: number;
    achievement?: number;
    reportAvg?: number;
    achievementNotes?: string;
}

export async function updateStudentScore(studentId: string, data: UpdateScoreData) {
    try {
        await db.grades.upsert({
            where: { studentId },
            create: {
                studentId,
                nilaiUjianTeori: data.theory,
                nilaiUjianSKUA: data.skua,
                nilaiPrestasi: data.achievement,
                rataRataNilai: data.reportAvg,
                catatanPrestasi: data.achievementNotes
            },
            update: {
                nilaiUjianTeori: data.theory,
                nilaiUjianSKUA: data.skua,
                nilaiPrestasi: data.achievement,
                rataRataNilai: data.reportAvg,
                catatanPrestasi: data.achievementNotes
            }
        });

        revalidatePath("/admin/ranking");
        revalidatePath("/admin/grades");
        return { success: true };
    } catch (error) {
        console.error("Update score error:", error);
        return { success: false, error: "Gagal update nilai" };
    }
}

import { sendWhatsApp } from "@/lib/whatsapp";

export async function autoSelectStudents(filters?: { waveId?: string; jalur?: JalurPendaftaran }) {
    try {
        // 1. Get Quota and Settings
        const settingsRaw = await db.$queryRaw<SchoolSettings[]>`SELECT * FROM "SchoolSettings" LIMIT 1`;
        const settings = settingsRaw[0] || {};

        // Default Global Quotas
        const globalQuotas: Record<string, number> = {
            "REGULER": settings.quotaReguler || 50,
            "PRESTASI_AKADEMIK": settings.quotaPrestasiAkademik || 15,
            "PRESTASI_NON_AKADEMIK": settings.quotaPrestasiNonAkademik || 15,
            "AFIRMASI": settings.quotaAfirmasi || 20
        };

        let activeQuotas = { ...globalQuotas };
        let totalWaveLimit = settings.studentQuota || 100;

        // 2. Override with Wave Specific Quotas if filter provided
        if (filters?.waveId) {
            const wave = await db.wave.findUnique({
                where: { id: filters.waveId }
            });

            if (wave) {
                if (wave.quota > 0) totalWaveLimit = wave.quota;

                if (wave.pathQuotas && typeof wave.pathQuotas === 'object') {
                    const wavePaths = wave.pathQuotas as Record<string, number>;
                    // Path quotas in wave override global ones for paths that are defined
                    Object.keys(wavePaths).forEach(path => {
                        activeQuotas[path] = wavePaths[path];
                    });
                }
            }
        }

        // 3. Get Verified Students with Ranking Data based on filters
        // For the full process, we need all students to handle moves
        const processingFilters = filters?.jalur ? filters : { waveId: filters?.waveId };
        const { students: allStudents } = await getRankingData(processingFilters);

        if (allStudents.length === 0) {
            return { success: false, error: "Tidak ada data murid terverifikasi pada filter ini." };
        }

        // Process Scores Logic (to be reused)
        const pathDefaults: Record<string, any> = {
            "REGULER": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
            "AFIRMASI": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
            "PRESTASI_AKADEMIK": { rapor: 30, ujian: 30, skua: 30, prestasi: 10 },
            "PRESTASI_NON_AKADEMIK": { rapor: 0, ujian: 30, skua: 30, prestasi: 40 },
        };

        const recalculateScore = (student: RankedStudent, targetJalur: JalurPendaftaran) => {
            const grades = student.grades;
            const pathWeights = ((settings as any)?.pathWeights as Record<string, any>) || {};
            const specificWeights = pathWeights[targetJalur];
            const defaultW = pathDefaults[targetJalur] || { rapor: 0, ujian: 50, skua: 50, prestasi: 0 };

            const wRapor = (specificWeights?.rapor ?? defaultW.rapor) / 100;
            const wUjian = (specificWeights?.ujian ?? defaultW.ujian) / 100;
            const wSKUA = (specificWeights?.skua ?? defaultW.skua) / 100;

            const avgReport = grades?.rataRataNilai || 0;
            const theory = grades?.nilaiUjianTeori || 0;
            const skua = grades?.nilaiUjianSKUA || 0;
            const achievement = grades?.nilaiPrestasi || 0;

            let finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
            finalScore = parseFloat(finalScore.toFixed(2));

            return {
                ...student,
                jalur: targetJalur,
                grades: grades ? { ...grades, finalScore } : null
            } as RankedStudent;
        };

        // 4. Multi-stage Selection Logic
        const passedIds: string[] = [];
        const failedIds: string[] = [];
        const movedStudents: { student: RankedStudent; originalJalur: string }[] = [];

        // Track processed IDs to avoid double counting
        const processedIds = new Set<string>();

        // Stage 1: Process Achievement Paths (Academic & Non-Academic)
        const achievementJalurs: JalurPendaftaran[] = ["PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK"];

        for (const jalur of achievementJalurs) {
            const group = allStudents.filter(s => s.jalur === jalur);
            const quota = activeQuotas[jalur] || 0;

            const passed = group.slice(0, quota);
            const failed = group.slice(quota);

            passed.forEach(s => {
                passedIds.push(s.id);
                processedIds.add(s.id);
            });

            // Failed achievement students are moved to movedStudents list for Stage 2
            failed.forEach(s => {
                movedStudents.push({
                    student: recalculateScore(s, "REGULER"),
                    originalJalur: jalur
                });
            });
        }

        // Stage 2: Process Afirmasi
        const afirmasiGroup = allStudents.filter(s => s.jalur === "AFIRMASI");
        const afirmasiQuota = activeQuotas["AFIRMASI"] || 0;
        const afirmasiPassed = afirmasiGroup.slice(0, afirmasiQuota);
        const afirmasiFailed = afirmasiGroup.slice(afirmasiQuota);

        afirmasiPassed.forEach(s => {
            passedIds.push(s.id);
            processedIds.add(s.id);
        });

        // AFIRMASI failed students are now also moved to REGULER pool
        afirmasiFailed.forEach(s => {
            movedStudents.push({
                student: recalculateScore(s, "REGULER"),
                originalJalur: "AFIRMASI"
            });
        });

        // Stage 3: Process Reguler (Original Reguler + Moved from Achievement)
        const originalReguler = allStudents.filter(s => s.jalur === "REGULER");
        const combinedReguler = [...originalReguler, ...movedStudents.map(m => m.student)];

        // Re-sort combined reguler
        combinedReguler.sort((a, b) => {
            const scoreA = a.grades?.finalScore || 0;
            const scoreB = b.grades?.finalScore || 0;
            return scoreB - scoreA;
        });

        const regulerQuota = activeQuotas["REGULER"] || 0;
        const regulerPassed = combinedReguler.slice(0, regulerQuota);
        const regulerFailed = combinedReguler.slice(regulerQuota);

        regulerPassed.forEach(s => {
            passedIds.push(s.id);
            processedIds.add(s.id);
        });
        regulerFailed.forEach(s => {
            failedIds.push(s.id);
            processedIds.add(s.id);
        });

        // 5. Update Database and Notifications
        // Update Passed
        if (passedIds.length > 0) {
            await db.student.updateMany({
                where: { id: { in: passedIds } },
                data: { statusKelulusan: "LULUS" }
            });
        }

        // Update Failed
        if (failedIds.length > 0) {
            await db.student.updateMany({
                where: { id: { in: failedIds } },
                data: { statusKelulusan: "TIDAK_LULUS" }
            });
        }

        // Specific Updates for Moved Students
        for (const moved of movedStudents) {
            const s = moved.student;
            const isPassed = passedIds.includes(s.id);

            // Update Jalur to REGULER and add note
            await db.student.update({
                where: { id: s.id },
                data: {
                    jalur: "REGULER",
                    catatanPenolakan: `Dipindahkan dari jalur ${moved.originalJalur} ke REGULER. ` +
                        (isPassed ? "Lolos di jalur REGULER." : "Tidak lolos di jalur REGULER.")
                }
            });

            // Send WhatsApp notification
            if (s.telepon) {
                const message = `Halo ${s.namaLengkap},\n\n` +
                    `Kami menginformasikan bahwa berdasarkan hasil seleksi, Anda tidak masuk di kuota ${moved.originalJalur}. ` +
                    `Sesuai ketentuan, Anda telah dipindahkan ke jalur REGULER dan telah dilakukan perangkingan ulang.\n\n` +
                    `Status Kelulusan Anda: ${isPassed ? "LULUS" : "TIDAK LULUS"}.\n` +
                    `Silakan cek detail di dashboard pendaftaran.\n\n` +
                    `Terima kasih.`;

                await sendWhatsApp(s.telepon, message);
            }

            // Add to History
            await db.registrationHistory.create({
                data: {
                    studentId: s.id,
                    waveId: s.waveId,
                    jalur: "REGULER",
                    status: isPassed ? "LULUS" : "TIDAK_LULUS",
                    notes: `Otomatis pindah dari ${moved.originalJalur} karena kuota penuh.`
                }
            });
        }

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `Seleksi otomatis selesai dengan pergerakan jalur pendaftar prestasi ke reguler.\n` +
                `Total Murid Diproses: ${allStudents.length}\n` +
                `Total Diterima: ${passedIds.length}`
        };

    } catch (error) {
        console.error("Auto selection error:", error);
        return { success: false, error: "Terjadi kesalahan saat seleksi otomatis." };
    }
}
