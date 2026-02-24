import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { db } from "@/lib/db";

async function handler(req: Request, session: any, { params }: { params: { id: string } }) {
    try {
        const studentId = params.id;
        const body = await req.json(); // { payloads: [{ semesterId: string, entries: [{ subjectId: string, score: number }] }] }
        const { payloads } = body;

        // Verify the student belongs to the logged-in user
        const existingStudent = await db.student.findUnique({
            where: { id: studentId },
            include: { user: true }
        });

        if (!existingStudent) {
            return NextResponse.json({ message: "Siswa tidak ditemukan" }, { status: 404 });
        }

        const user = await db.user.findUnique({
            where: { email: session.email }
        });

        if (!user || existingStudent.userId !== user.id) {
            return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
        }

        if (existingStudent.statusVerifikasi === 'VERIFIED') {
            return NextResponse.json({ message: "Nilai tidak dapat diubah karena data sudah diverifikasi" }, { status: 400 });
        }

        // --- VALIDATION FOR ACADEMIC PATH ---
        if (existingStudent.jalur === "PRESTASI_AKADEMIK") {
            let totalSemesterAvg = 0;
            let semesterCount = 0;

            for (const item of payloads) {
                const totalScore = item.entries.reduce((acc: number, curr: any) => acc + curr.score, 0);
                const average = item.entries.length > 0
                    ? totalScore / item.entries.length
                    : 0;

                if (item.entries.length > 0) {
                    totalSemesterAvg += average;
                    semesterCount++;
                }
            }

            const grandAverage = semesterCount > 0 ? totalSemesterAvg / semesterCount : 0;

            if (grandAverage < 85) {
                return NextResponse.json({
                    message: `Mohon maaf, rata-rata nilai raport Anda adalah ${grandAverage.toFixed(2)}. Syarat pendaftaran jalur Prestasi Akademik minimal rata-rata 85.`
                }, { status: 400 });
            }
        }

        // Upsert grades record
        const gradeRecord = await db.grades.upsert({
            where: { studentId },
            create: { studentId },
            update: {}
        });

        for (const item of payloads) {
            // Calculate Average
            const totalScore = item.entries.reduce((acc: number, curr: any) => acc + curr.score, 0);
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
                        data: item.entries.map((e: any) => ({
                            semesterGradeId: semesterGrade.id,
                            subjectId: e.subjectId,
                            score: e.score
                        }))
                    });
                }
            });
        }

        // Recalculate Global Average
        const allSemesters = await db.semesterGrade.findMany({
            where: { gradeId: gradeRecord.id }
        });

        if (allSemesters.length > 0) {
            const sumOfAverages = allSemesters.reduce((acc: number, curr: any) => acc + curr.rataRataSemester, 0);
            const grandAverage = parseFloat((sumOfAverages / allSemesters.length).toFixed(2));

            await db.grades.update({
                where: { id: gradeRecord.id },
                data: { rataRataNilai: grandAverage }
            });
        }

        return NextResponse.json({ message: "Nilai berhasil disimpan" });

    } catch (error) {
        console.error("API Save Grades Error:", error);
        return NextResponse.json({ message: "Gagal menyimpan nilai" }, { status: 500 });
    }
}

export async function POST(req: Request, context: any) {
    return withAuth(req, (req, session) => handler(req, session, context));
}
