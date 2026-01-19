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

export async function getRankingData(): Promise<RankedStudent[]> {
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
        const settings = await db.schoolSettings.findFirst();

        // Default weights if not set
        const wRapor = (settings?.weightRapor ?? 40) / 100;
        const wUjian = (settings?.weightUjian ?? 30) / 100;
        const wSKUA = (settings?.weightSKUA ?? 30) / 100;

        // 3. Process Scores
        const rankedStudents: RankedStudent[] = students.map((student) => {
            const grades = student.grades;

            // Base Scores
            const avgReport = grades?.rataRataNilai || 0;
            const theory = grades?.nilaiUjianTeori || 0;
            const skua = grades?.nilaiUjianSKUA || 0;
            const achievement = grades?.nilaiPrestasi || 0;

            // FORMULA BASED ON JALUR:
            let finalScore = 0;

            switch (student.jalur) {
                case "PRESTASI_AKADEMIK":
                    // Raport + Teori + SKUA + Prestasi
                    finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
                    break;
                case "PRESTASI_NON_AKADEMIK":
                    // SKUA + Prestasi (No Rapor, No Teori)
                    finalScore = (skua * wSKUA) + achievement;
                    break;
                case "REGULER":
                    // Teori + SKUA (No Rapor)
                    finalScore = (theory * wUjian) + (skua * wSKUA);
                    break;
                case "AFIRMASI":
                    // Teori + SKUA (No Rapor)
                    finalScore = (theory * wUjian) + (skua * wSKUA);
                    break;
                default:
                    // Default fallback
                    finalScore = (avgReport * wRapor) + (theory * wUjian) + (skua * wSKUA) + achievement;
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

export async function autoSelectStudents() {
    try {
        // 1. Get Quota and Settings
        // Use Raw Query for Settings to be safe
        const settingsRaw = await db.$queryRaw<SchoolSettings[]>`SELECT * FROM "SchoolSettings" LIMIT 1`;
        const settings = settingsRaw[0] || {};

        // Quotas
        const quotaReguler = settings.quotaReguler || 50;
        const quotaPrestasi = (settings.quotaPrestasiAkademik || 15) + (settings.quotaPrestasiNonAkademik || 15);
        const quotaAfirmasi = settings.quotaAfirmasi || 20;

        // 2. Get All Verified Students with Ranking Data
        const allStudents = await getRankingData();

        if (allStudents.length === 0) {
            return { success: false, error: "Tidak ada data siswa terverifikasi." };
        }

        // 3. Group by Path (Jalur)
        const studentsReguler = allStudents.filter((s) => s.jalur === "REGULER");
        const studentsPrestasi = allStudents.filter((s) => s.jalur === "PRESTASI_AKADEMIK" || s.jalur === "PRESTASI_NON_AKADEMIK");
        const studentsAfirmasi = allStudents.filter((s) => s.jalur === "AFIRMASI");

        // 4. Select based on Quota (Assuming sorted DESC by score from getRankingData)
        const passedReguler = studentsReguler.slice(0, quotaReguler);
        const failedReguler = studentsReguler.slice(quotaReguler);

        const passedPrestasi = studentsPrestasi.slice(0, quotaPrestasi);
        const failedPrestasi = studentsPrestasi.slice(quotaPrestasi);

        const passedAfirmasi = studentsAfirmasi.slice(0, quotaAfirmasi);
        const failedAfirmasi = studentsAfirmasi.slice(quotaAfirmasi);

        // Combine
        const passedStudents = [...passedReguler, ...passedPrestasi, ...passedAfirmasi];
        const failedStudents = [...failedReguler, ...failedPrestasi, ...failedAfirmasi];

        // 5. Update Database

        // Update Passed Students
        if (passedStudents.length > 0) {
            await db.student.updateMany({
                where: {
                    id: { in: passedStudents.map((s) => s.id) }
                },
                data: { statusKelulusan: "LULUS" }
            });
        }

        // Update Failed Students
        if (failedStudents.length > 0) {
            await db.student.updateMany({
                where: {
                    id: { in: failedStudents.map((s) => s.id) }
                },
                data: { statusKelulusan: "TIDAK_LULUS" }
            });
        }

        revalidatePath("/admin/reports/ranking");
        revalidatePath("/dashboard"); // For the announcement banner

        return {
            success: true,
            message: `Seleksi otomatis selesai. \n` +
                `Reguler: ${passedReguler.length}/${quotaReguler} \n` +
                `Prestasi: ${passedPrestasi.length}/${quotaPrestasi} \n` +
                `Afirmasi: ${passedAfirmasi.length}/${quotaAfirmasi} \n` +
                `Total Diterima: ${passedStudents.length}`
        };

    } catch (error) {
        console.error("Auto selection error:", error);
        return { success: false, error: "Terjadi kesalahan saat seleksi otomatis." };
    }
}

