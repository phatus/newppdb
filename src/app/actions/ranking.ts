"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getRankingData() {
    try {
        // 1. Fetch Students who are verified
        const students = await db.student.findMany({
            where: { statusVerifikasi: "VERIFIED" },
            include: {
                grades: true,
                documents: true, // Needed to check achievements
            }
        });

        // 2. Fetch Settings for Weights
        const settings: any = await db.schoolSettings.findFirst();

        // Default weights if not set
        const wRapor = (settings?.weightRapor ?? 40) / 100;
        const wUjian = (settings?.weightUjian ?? 30) / 100;
        const wSKUA = (settings?.weightSKUA ?? 30) / 100;

        // 3. Process Scores
        const rankedStudents = students.map((student: any) => {
            const grades = student.grades;

            // Base Scores
            const avgReport = grades?.rataRataNilai || 0;
            const theory = grades?.nilaiUjianTeori || 0;
            const skua = grades?.nilaiUjianSKUA || 0;
            const achievement = grades?.nilaiPrestasi || 0;

            // FORMULA: 
            // Final = (Rapor * wRapor) + (Theory * wUjian) + (SKUA * wSKUA) + Achievement

            let finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
            finalScore = parseFloat(finalScore.toFixed(2));

            return {
                ...student,
                grades: {
                    ...grades,
                    finalScore
                }
            };
        });

        // 4. Sort by Final Score DESC
        rankedStudents.sort((a: any, b: any) => (b.grades.finalScore || 0) - (a.grades.finalScore || 0));

        return rankedStudents;

    } catch (error) {
        console.error("Error fetching ranking:", error);
        return [];
    }
}

export async function updateStudentScore(studentId: string, data: {
    theory?: number;
    skua?: number;
    achievement?: number;
}) {
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
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal update nilai" };
    }
}

export async function autoSelectStudents() {
    try {
        // 1. Get Quota and Settings
        // Use Raw Query for Settings to be safe
        const settingsRaw: any[] = await db.$queryRaw`SELECT * FROM "SchoolSettings" LIMIT 1`;
        const settings = settingsRaw[0] || {};
        const quota = settings.studentQuota || 100;

        // 2. Get All Verified Students with Ranking Data
        const students = await getRankingData();

        if (students.length === 0) {
            return { success: false, error: "Tidak ada data siswa terverifikasi." };
        }

        // 3. Separate Passed and Failed
        // The list is already sorted by Final Score DESC in getRankingData
        const passedStudents = students.slice(0, quota);
        const failedStudents = students.slice(quota);

        // 4. Update Database

        // Update Passed Students
        if (passedStudents.length > 0) {
            await db.student.updateMany({
                where: {
                    id: { in: passedStudents.map((s: any) => s.id) }
                },
                data: { statusKelulusan: "LULUS" }
            });
        }

        // Update Failed Students
        if (failedStudents.length > 0) {
            await db.student.updateMany({
                where: {
                    id: { in: failedStudents.map((s: any) => s.id) }
                },
                data: { statusKelulusan: "TIDAK_LULUS" }
            });
        }

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/dashboard"); // For the announcement banner

        return {
            success: true,
            message: `Seleksi otomatis selesai. Diterima: ${passedStudents.length}, Tidak Diterima: ${failedStudents.length} (Kuota: ${quota})`
        };

    } catch (error) {
        console.error("Auto selection error:", error);
        return { success: false, error: "Terjadi kesalahan saat seleksi otomatis." };
    }
}
