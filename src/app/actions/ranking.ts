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
