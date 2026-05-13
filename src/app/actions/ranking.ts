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
    grades: (Grades & { finalScore: number; nilaiAfirmasi: number | null }) | null;
};

/**
 * Fetches and ranks student data with optional pagination and filters.
 * Returns an object containing the ranked students and total count.
 */
export async function getRankingData(filters?: { waveId?: string | null; jalur?: JalurPendaftaran; forceLive?: boolean; q?: string }, skip?: number, take?: number): Promise<{ students: RankedStudent[], totalCount: number }> {
    try {
        // 1. Fetch Students who are verified
        const where: any = { statusVerifikasi: "VERIFIED" };
        if (filters?.waveId !== undefined) where.waveId = filters.waveId;
        if (filters?.jalur) where.jalur = filters.jalur;
        if (filters?.q) {
            where.OR = [
                { namaLengkap: { contains: filters.q, mode: 'insensitive' } },
                { nisn: { contains: filters.q, mode: 'insensitive' } }
            ];
        }

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
        const isLive = filters?.forceLive || ((settings as any)?.isRankingLive ?? true);

        const rankedStudents: RankedStudent[] = students.map((student) => {
            const grades = student.grades;

            let finalScore = 0;

            if (isLive) {
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
                const isPrestasiAkademik = student.jalur === "PRESTASI_AKADEMIK";
                const isPrestasiNonAkademik = student.jalur === "PRESTASI_NON_AKADEMIK";
                const isAfirmasi = student.jalur === "AFIRMASI";
                const achievement = (isPrestasiAkademik || isPrestasiNonAkademik) ? (grades?.nilaiPrestasi || 0) : 0;
                const afirmasiPoint = isAfirmasi ? (grades?.nilaiAfirmasi || 0) : 0;

                // Calculate Final Score
                finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement + afirmasiPoint;
            } else {
                // Use frozen score if not live
                finalScore = (grades as any)?.frozenScore || 0;
            }

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
    afirmasi?: number;
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
                nilaiAfirmasi: data.afirmasi,
                rataRataNilai: data.reportAvg,
                catatanPrestasi: data.achievementNotes
            },
            update: {
                nilaiUjianTeori: data.theory,
                nilaiUjianSKUA: data.skua,
                nilaiPrestasi: data.achievement,
                nilaiAfirmasi: data.afirmasi,
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

/**
 * Updates the frozenScore for all students based on currently calculated live scores.
 */
export async function updateRankingSnapshot() {
    try {
        // 1. Get all ranked data (temporarily force live to get latest values)
        // We can't easily "force live" without changing settings, so we calculate here
        const { students } = await getRankingData(); 
        
        // Wait, getRankingData above will respect settings.
        // Let's do a raw calculation to be safe or ensure settings are ignored.
        // Actually, we can just fetch all students and calculate.
        
        const settings = await db.schoolSettings.findFirst();
        
        // Use the same logic as getRankingData but always calculate
        for (const student of students) {
            // We need to re-calculate because getRankingData might have returned frozenScore
            // Let's reuse the calculation logic briefly
            
             // Smart Defaults
            const pathDefaults: Record<string, any> = {
                "REGULER": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
                "AFIRMASI": { rapor: 40, ujian: 30, skua: 30, prestasi: 0 },
                "PRESTASI_AKADEMIK": { rapor: 30, ujian: 30, skua: 30, prestasi: 10 },
                "PRESTASI_NON_AKADEMIK": { rapor: 0, ujian: 30, skua: 30, prestasi: 40 },
            };

            const grades = student.grades;
            const pathWeights = ((settings as any)?.pathWeights as Record<string, any>) || {};
            const specificWeights = pathWeights[student.jalur];
            const defaultW = pathDefaults[student.jalur] || {
                rapor: (settings as any)?.weightRapor ?? 40,
                ujian: (settings as any)?.weightUjian ?? 30,
                skua: (settings as any)?.weightSKUA ?? 30,
                prestasi: 0
            };

            const wRapor = (specificWeights?.rapor ?? defaultW.rapor) / 100;
            const wUjian = (specificWeights?.ujian ?? defaultW.ujian) / 100;
            const wSKUA = (specificWeights?.skua ?? defaultW.skua) / 100;

            const avgReport = (grades as any)?.rataRataNilai || 0;
            const theory = (grades as any)?.nilaiUjianTeori || 0;
            const skua = (grades as any)?.nilaiUjianSKUA || 0;
            const isPrestasiAkademik = student.jalur === "PRESTASI_AKADEMIK";
            const isPrestasiNonAkademik = student.jalur === "PRESTASI_NON_AKADEMIK";
            const isAfirmasi = student.jalur === "AFIRMASI";
            const achievement = (isPrestasiAkademik || isPrestasiNonAkademik) ? ((grades as any)?.nilaiPrestasi || 0) : 0;
            const afirmasiPoint = isAfirmasi ? ((grades as any)?.nilaiAfirmasi || 0) : 0;

            let liveScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement + afirmasiPoint;
            liveScore = parseFloat(liveScore.toFixed(2));

            if (student.grades) {
                await db.$executeRawUnsafe(
                    `UPDATE "Grades" SET "frozenScore" = $1 WHERE "studentId" = $2`,
                    liveScore,
                    student.id
                );
            }
        }

        revalidatePath("/ranking");
        revalidatePath("/admin/reports/ranking");
        return { success: true };
    } catch (error) {
        console.error("Snapshot error:", error);
        return { success: false, error: "Gagal update snapshot ranking" };
    }
}

import { sendWhatsApp } from "@/lib/whatsapp";

/**
 * Internal helper to process selection for a single wave with its specific quotas.
 */
async function processSingleWaveSelection(
    wave: any, 
    settings: any, 
    globalQuotas: Record<string, number>
) {
    // 1. Determine Quotas for this Wave
    const activeQuotas = { ...globalQuotas };
    let totalWaveLimit = settings.studentQuota || 100;

    if (wave) {
        if (wave.quota > 0) totalWaveLimit = wave.quota;

        let wavePathsObj = wave.pathQuotas;
        if (typeof wave.pathQuotas === 'string') {
            try { wavePathsObj = JSON.parse(wave.pathQuotas); } catch (e) {}
        }

        if (wavePathsObj && typeof wavePathsObj === 'object') {
            const wavePaths = wavePathsObj as Record<string, any>;
            Object.keys(wavePaths).forEach(path => {
                const pathQuota = Number(wavePaths[path]);
                if (!isNaN(pathQuota) && pathQuota > 0) {
                    activeQuotas[path] = pathQuota;
                }
            });
        }
    }

    console.log(`[AutoSelect] Processing Wave: ${wave?.name || "Global"}`);
    console.log(`[AutoSelect] Active Quotas:`, activeQuotas);

    // 2. Get ALL Verified Students for this Wave (Ignoring path filter)
    const { students: allStudents } = await getRankingData({ waveId: wave ? wave.id : null });

    if (allStudents.length === 0) return { processed: 0, passed: 0 };

    // Process Scores Logic (re-using the same formula as in getRankingData)
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
        const isPrestasiAkademik = targetJalur === "PRESTASI_AKADEMIK";
        const isPrestasiNonAkademik = targetJalur === "PRESTASI_NON_AKADEMIK";
        const achievement = (isPrestasiAkademik || isPrestasiNonAkademik) ? (grades?.nilaiPrestasi || 0) : 0;

        let finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
        finalScore = parseFloat(finalScore.toFixed(2));

        return {
            ...student,
            jalur: targetJalur,
            grades: grades ? { ...grades, finalScore } : null
        } as RankedStudent;
    };

    // 3. Multi-stage Selection Logic
    const passedIds: string[] = [];
    const failedIds: string[] = [];
    const movedStudents: { student: RankedStudent; originalJalur: string }[] = [];

    // Stage 1: Process Achievement Paths
    const achievementJalurs: JalurPendaftaran[] = ["PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK"];
    for (const jalur of achievementJalurs) {
        const group = allStudents.filter(s => s.jalur === jalur);
        const quota = activeQuotas[jalur] || 0;
        const passed = group.slice(0, quota);
        const failed = group.slice(quota);
        passed.forEach(s => passedIds.push(s.id));
        failed.forEach(s => movedStudents.push({
            student: recalculateScore(s, "REGULER"),
            originalJalur: jalur
        }));
    }

    // Stage 2: Process Afirmasi
    const afirmasiGroup = allStudents.filter(s => s.jalur === "AFIRMASI");
    const afirmasiQuota = activeQuotas["AFIRMASI"] || 0;
    const afirmasiPassed = afirmasiGroup.slice(0, afirmasiQuota);
    const afirmasiFailed = afirmasiGroup.slice(afirmasiQuota);
    afirmasiPassed.forEach(s => passedIds.push(s.id));
    afirmasiFailed.forEach(s => movedStudents.push({
        student: recalculateScore(s, "REGULER"),
        originalJalur: "AFIRMASI"
    }));

    // Stage 3: Process Reguler
    const originalReguler = allStudents.filter(s => s.jalur === "REGULER");
    const recalculatedOriginalReguler = originalReguler.map(s => recalculateScore(s, "REGULER"));
    const combinedReguler = [...recalculatedOriginalReguler, ...movedStudents.map(m => m.student)];

    combinedReguler.sort((a, b) => (b.grades?.finalScore ?? 0) - (a.grades?.finalScore ?? 0));

    const regulerQuota = activeQuotas["REGULER"] || 0;
    const regulerPassed = combinedReguler.slice(0, regulerQuota);
    const regulerFailed = combinedReguler.slice(regulerQuota);

    regulerPassed.forEach(s => passedIds.push(s.id));
    regulerFailed.forEach(s => failedIds.push(s.id));

    // 4. Update Database
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

    // Process Moved Students Updates & Notifications
    for (const moved of movedStudents) {
        const s = moved.student;
        const isPassed = passedIds.includes(s.id);
        await db.student.update({
            where: { id: s.id },
            data: {
                jalur: "REGULER",
                statusKelulusan: isPassed ? "LULUS" : "TIDAK_LULUS",
                catatanPenolakan: `Dipindahkan dari jalur ${moved.originalJalur} ke REGULER. ` +
                    (isPassed ? "Lolos di jalur REGULER." : "Tidak lolos di jalur REGULER.")
            }
        });

        if (s.telepon) {
            const message = `Halo ${s.namaLengkap},\n\n` +
                `Kami menginformasikan bahwa berdasarkan hasil seleksi, Anda tidak masuk di kuota ${moved.originalJalur}. ` +
                `Sesuai ketentuan, Anda telah dipindahkan ke jalur REGULER dan telah dilakukan perangkingan ulang.\n\n` +
                `Status Kelulusan Anda: ${isPassed ? "LULUS" : "TIDAK LULUS"}.\n` +
                `Silakan cek detail di dashboard pendaftaran.\n\n` +
                `Terima kasih.`;
            await sendWhatsApp(s.telepon, message);
        }

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

    return { processed: allStudents.length, passed: passedIds.length };
}

export async function autoSelectStudents(filters?: { waveId?: string; jalur?: JalurPendaftaran }) {
    try {
        const settings = await db.schoolSettings.findFirst() || {} as any;
        const globalQuotas: Record<string, number> = {
            "REGULER": settings.quotaReguler ?? 50,
            "PRESTASI_AKADEMIK": settings.quotaPrestasiAkademik ?? 15,
            "PRESTASI_NON_AKADEMIK": settings.quotaPrestasiNonAkademik ?? 15,
            "AFIRMASI": settings.quotaAfirmasi ?? 20
        };

        let totalProcessed = 0;
        let totalPassed = 0;

        if (filters?.waveId && filters.waveId !== "all") {
            // Process Single Wave
            const wave = await db.wave.findUnique({ where: { id: filters.waveId } });
            if (!wave) return { success: false, error: "Gelombang tidak ditemukan." };
            
            const result = await processSingleWaveSelection(wave, settings, globalQuotas);
            totalProcessed = result.processed;
            totalPassed = result.passed;
        } else {
            // Process All Waves one by one
            const waves = await db.wave.findMany({ where: { isActive: true } });
            for (const wave of waves) {
                const result = await processSingleWaveSelection(wave, settings, globalQuotas);
                totalProcessed += result.processed;
                totalPassed += result.passed;
            }

            // Also process students with NO waveId (if any) using global quotas
            const studentsWithNoWave = await db.student.findMany({ 
                where: { waveId: null, statusVerifikasi: "VERIFIED" } 
            });
            if (studentsWithNoWave.length > 0) {
                 const result = await processSingleWaveSelection(null, settings, globalQuotas);
                 totalProcessed += result.processed;
                 totalPassed += result.passed;
            }
        }

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/admin/ranking");
        revalidatePath("/dashboard");

        return {
            success: true,
            message: `Seleksi otomatis selesai.\n` +
                `Total Murid Diproses: ${totalProcessed}\n` +
                `Total Diterima: ${totalPassed}`
        };

    } catch (error) {
        console.error("Auto selection error:", error);
        return { success: false, error: "Terjadi kesalahan saat seleksi otomatis." };
    }
}


export async function undoMovedStudents(waveId?: string) {
    try {
        const filters = waveId && waveId !== "all" ? { waveId } : {};

        // Find students who have been moved
        const students = await db.student.findMany({
            where: {
                ...filters,
                catatanPenolakan: {
                    startsWith: "Dipindahkan dari jalur"
                }
            }
        });

        let restoredCount = 0;

        for (const student of students) {
            // Match pattern: Dipindahkan dari jalur PRESTASI_AKADEMIK ke REGULER
            const match = student.catatanPenolakan?.match(/Dipindahkan dari jalur (PRESTASI_AKADEMIK|PRESTASI_NON_AKADEMIK|AFIRMASI) ke REGULER/);

            if (match && match[1]) {
                const originalJalur = match[1] as JalurPendaftaran;

                await db.student.update({
                    where: { id: student.id },
                    data: {
                        jalur: originalJalur,
                        catatanPenolakan: null,
                    }
                });
                restoredCount++;
            }
        }

        // Reset statusKelulusan for ALL verified students in the wave to PENDING
        // This gives a clean slate for re-running auto selection
        await db.student.updateMany({
            where: {
                ...filters,
                statusVerifikasi: "VERIFIED"
            },
            data: {
                statusKelulusan: "PENDING"
            }
        });

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/admin/ranking");
        revalidatePath("/dashboard");

        return { 
            success: true, 
            message: `Berhasil mengembalikan ${restoredCount} murid ke jalur asal dan mereset status kelulusan menjadi PENDING untuk Seleksi Ulang.` 
        };
    } catch (error) {
        console.error("Undo move error:", error);
        return { success: false, error: "Gagal mengembalikan jalur pendaftar." };
    }
}
