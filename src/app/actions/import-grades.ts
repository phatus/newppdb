"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function importCBTGrades(data: any[]) {
    try {
        let successCount = 0;
        let failCount = 0;
        let updatedStudents = [];

        // Determine columns from header row if needed, but assuming mapped data passed from client
        // Data structure expected: { nomorUjian, nama, score }

        for (const row of data) {
            const { nomorUjian, nama, score } = row;

            if (!score) continue;

            let student = null;

            // 1. Try match by Nomor Ujian
            if (nomorUjian) {
                student = await db.student.findFirst({
                    where: { nomorUjian: nomorUjian }
                });
            }

            // 2. Fallback: Match by Name (Exact or Contains?)
            // Using fuzzy match might be dangerous for "Ahmad" vs "Ahmad Dhani".
            // Let's use strict match or Name + NISN if available.
            // For now, strict name match if no ID found.
            if (!student && nama) {
                student = await db.student.findFirst({
                    where: {
                        namaLengkap: {
                            equals: nama,
                            mode: 'insensitive'
                        }
                    }
                });
            }

            if (student) {
                // Update Grades
                // Upsert Grade record
                await db.grades.upsert({
                    where: { studentId: student.id },
                    create: {
                        studentId: student.id,
                        nilaiUjianTeori: parseFloat(score)
                    },
                    update: {
                        nilaiUjianTeori: parseFloat(score)
                    }
                });

                successCount++;
                updatedStudents.push({ name: student.namaLengkap, score: score, status: "Updated" });
            } else {
                failCount++;
                updatedStudents.push({ name: nama || "Unknown", score: score, status: "Student Not Found" });
            }
        }

        revalidatePath("/admin/grades");
        return { success: true, successCount, failCount, details: updatedStudents };
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: "Failed to process data" };
    }
}
