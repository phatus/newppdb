"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";

// --- Fetch Helper for Frontend ---
export async function getGradeFormSetup() {
    try {
        const semesters = await db.semester.findMany({
            where: {
                isActive: true,
                NOT: {
                    name: { contains: "Kelas 6 Semester 2" }
                }
            },
            orderBy: { order: 'asc' }
        });

        const subjects = await db.subject.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });

        return { semesters, subjects };
    } catch (error) {
        console.error("Error fetching setup:", error);
        return { semesters: [], subjects: [] };
    }
}

// --- Save Single Semester Grades ---
export async function saveSemesterGrades(studentId: string, payload: {
    semesterId: string;
    entries: { subjectId: string; score: number }[];
}) {
    try {
        // 1. Get or Create parent Grade record
        const gradeRecord = await db.grades.upsert({
            where: { studentId },
            create: { studentId },
            update: {}
        });

        // 2. Calculate Semester Average
        const totalScore = payload.entries.reduce((acc, curr) => acc + curr.score, 0);
        const average = payload.entries.length > 0
            ? parseFloat((totalScore / payload.entries.length).toFixed(2))
            : 0;

        // 3. Upsert Semester Grade
        const semesterGrade = await db.semesterGrade.upsert({
            where: {
                gradeId_semesterId: {
                    gradeId: gradeRecord.id,
                    semesterId: payload.semesterId
                }
            },
            create: {
                gradeId: gradeRecord.id,
                semesterId: payload.semesterId,
                rataRataSemester: average
            },
            update: {
                rataRataSemester: average
            }
        });

        // 4. Overwrite Grade Entries (Delete all then Create new)
        // Transaction ensures atomicity
        await db.$transaction(async (tx: any) => {
            // Remove existing entries for this semester
            await tx.gradeEntry.deleteMany({
                where: { semesterGradeId: semesterGrade.id }
            });

            // Create new entries
            for (const entry of payload.entries) {
                await tx.gradeEntry.create({
                    data: {
                        semesterGradeId: semesterGrade.id,
                        subjectId: entry.subjectId,
                        score: entry.score
                    }
                });
            }
        });

        // 5. Recalculate Global Average
        await recalculateGlobalAverage(gradeRecord.id);

        revalidatePath("/dashboard");

        await logActivity("UPDATE_GRADE", "GRADE", gradeRecord.id, `Updated Semester: ${payload.semesterId}`);

        return { success: true };
    } catch (error: any) {
        console.error("Error saving semester grades:", error);
        return { success: false, error: error.message || "Gagal menyimpan nilai" };
    }
}

// --- Bulk Save (for "Simpan Semua" in Modal) ---
export async function saveAllSemesterGrades(studentId: string, payload: {
    semesterId: string;
    entries: { subjectId: string; score: number }[];
}[]) {
    try {
        const gradeRecord = await db.grades.upsert({
            where: { studentId },
            create: { studentId },
            update: {}
        });

        for (const item of payload) {
            // Re-using logic but inside loop. Ideally, we should batch this better, 
            // but for low traffic this is fine.

            // Calculate Average
            const totalScore = item.entries.reduce((acc, curr) => acc + curr.score, 0);
            const average = item.entries.length > 0
                ? parseFloat((totalScore / item.entries.length).toFixed(2))
                : 0;

            const semesterGrade = await db.semesterGrade.upsert({
                where: {
                    gradeId_semesterId: {
                        gradeId: gradeRecord.id,
                        semesterId: item.semesterId
                    }
                },
                create: {
                    gradeId: gradeRecord.id,
                    semesterId: item.semesterId,
                    rataRataSemester: average
                },
                update: {
                    rataRataSemester: average
                }
            });

            await db.$transaction(async (tx: any) => {
                await tx.gradeEntry.deleteMany({
                    where: { semesterGradeId: semesterGrade.id }
                });

                if (item.entries.length > 0) {
                    await tx.gradeEntry.createMany({
                        data: item.entries.map(e => ({
                            semesterGradeId: semesterGrade.id,
                            subjectId: e.subjectId,
                            score: e.score
                        }))
                    });
                }
            });
        }

        await recalculateGlobalAverage(gradeRecord.id);

        revalidatePath("/dashboard");

        await logActivity("UPDATE_GRADE", "GRADE", gradeRecord.id, `Bulk update ${payload.length} semesters`);

        return { success: true };
    } catch (error: any) {
        console.error("Error saving all grades:", error);
        return { success: false, error: error.message || "Gagal menyimpan semua nilai" };
    }
}

// --- Helper: Recalculate Global Average ---
async function recalculateGlobalAverage(gradeId: string) {
    const allSemesters = await db.semesterGrade.findMany({
        where: { gradeId: gradeId }
    });

    if (allSemesters.length > 0) {
        // Simple Average of Semester Averages
        const sumOfAverages = allSemesters.reduce((acc: number, curr: any) => acc + curr.rataRataSemester, 0);
        const grandAverage = parseFloat((sumOfAverages / allSemesters.length).toFixed(2));

        await db.grades.update({
            where: { id: gradeId },
            data: { rataRataNilai: grandAverage }
        });
    }
}

