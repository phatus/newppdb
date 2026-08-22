"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function getClassLetter(index: number): string {
    let result = "";
    let i = index;
    while (i >= 0) {
        result = String.fromCharCode(65 + (i % 26)) + result;
        i = Math.floor(i / 26) - 1;
    }
    return result;
}

export async function getOrientationClasses(academicYear?: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized", classes: [], unassignedStudents: [] };
    }

    try {
        const settings = await db.schoolSettings.findFirst();
        const targetYear = academicYear && academicYear !== "all" ? academicYear : (settings?.academicYear || "2026/2027");

        const classes = await db.orientationClass.findMany({
            where: { academicYear: targetYear },
            orderBy: { name: "asc" },
            include: {
                students: {
                    orderBy: { namaLengkap: "asc" },
                    select: {
                        id: true,
                        namaLengkap: true,
                        nisn: true,
                        gender: true,
                        asalSekolah: true,
                        jalur: true,
                        statusVerifikasi: true,
                        statusKelulusan: true,
                    }
                }
            }
        });

        // Compute summary for each class
        const formattedClasses = classes.map(c => {
            const maleCount = c.students.filter(s => s.gender?.toUpperCase().startsWith("L")).length;
            const femaleCount = c.students.length - maleCount;
            return {
                ...c,
                totalStudents: c.students.length,
                maleCount,
                femaleCount,
            };
        });

        // Unassigned accepted students
        const unassignedStudents = await db.student.findMany({
            where: {
                academicYear: targetYear,
                statusVerifikasi: "VERIFIED",
                statusKelulusan: "LULUS",
                orientationClassId: null,
            },
            orderBy: { namaLengkap: "asc" },
            select: {
                id: true,
                namaLengkap: true,
                nisn: true,
                gender: true,
                asalSekolah: true,
                jalur: true,
            }
        });

        const totalAcceptedCount = await db.student.count({
            where: {
                academicYear: targetYear,
                statusVerifikasi: "VERIFIED",
                statusKelulusan: "LULUS",
            }
        });

        return {
            success: true,
            academicYear: targetYear,
            totalAcceptedStudents: totalAcceptedCount,
            classes: formattedClasses,
            unassignedStudents,
        };
    } catch (error: unknown) {
        console.error("Error fetching orientation classes:", error);
        return { success: false, error: "Gagal mengambil data kelas orientasi", classes: [], unassignedStudents: [] };
    }
}

export async function generateOrientationClasses({
    academicYear,
    capacityPerClass = 32,
    namePrefix = "Kelas Matsama",
}: {
    academicYear?: string;
    capacityPerClass?: number;
    namePrefix?: string;
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const settings = await db.schoolSettings.findFirst();
        const targetYear = academicYear && academicYear !== "all" ? academicYear : (settings?.academicYear || "2026/2027");
        const capacity = Math.max(1, Number(capacityPerClass) || 32);
        const prefix = namePrefix.trim() || "Kelas Matsama";

        // Fetch all accepted verified students
        const students = await db.student.findMany({
            where: {
                academicYear: targetYear,
                statusVerifikasi: "VERIFIED",
                statusKelulusan: "LULUS",
            },
            orderBy: { namaLengkap: "asc" },
            select: {
                id: true,
                namaLengkap: true,
                gender: true,
            }
        });

        if (students.length === 0) {
            return {
                success: false,
                error: `Tidak ada pendaftar dengan status LULUS & TERVERIFIKASI pada Tahun Pelajaran ${targetYear}.`
            };
        }

        // Separate by gender
        const males = students.filter(s => s.gender?.toUpperCase().startsWith("L"));
        const females = students.filter(s => !s.gender?.toUpperCase().startsWith("L"));

        // Calculate total classes needed
        const totalStudents = students.length;
        const totalClasses = Math.max(1, Math.ceil(totalStudents / capacity));

        // Create class placeholders
        const classAssignments: { name: string; studentIds: string[] }[] = Array.from(
            { length: totalClasses },
            (_, i) => ({
                name: `${prefix} ${getClassLetter(i)}`,
                studentIds: [],
            })
        );

        // Distribute males evenly (Round-Robin)
        males.forEach((m, idx) => {
            const classIdx = idx % totalClasses;
            classAssignments[classIdx].studentIds.push(m.id);
        });

        // Distribute females evenly (Round-Robin)
        females.forEach((f, idx) => {
            const classIdx = idx % totalClasses;
            classAssignments[classIdx].studentIds.push(f.id);
        });

        // Database Transaction: Reset old classes for targetYear & create new ones
        await db.$transaction(async (tx) => {
            // Unassign students from old classes for targetYear
            await tx.student.updateMany({
                where: { academicYear: targetYear },
                data: { orientationClassId: null },
            });

            // Delete existing classes for targetYear
            await tx.orientationClass.deleteMany({
                where: { academicYear: targetYear },
            });

            // Create new classes and assign students
            for (const item of classAssignments) {
                const newClass = await tx.orientationClass.create({
                    data: {
                        name: item.name,
                        academicYear: targetYear,
                        capacity: capacity,
                    }
                });

                if (item.studentIds.length > 0) {
                    await tx.student.updateMany({
                        where: { id: { in: item.studentIds } },
                        data: { orientationClassId: newClass.id },
                    });
                }
            }
        });

        revalidatePath("/admin/classes");
        return {
            success: true,
            message: `Berhasil membagi ${totalStudents} siswa (👨 ${males.length} Laki-laki, 👩 ${females.length} Perempuan) ke dalam ${totalClasses} ${prefix}.`,
        };
    } catch (error: unknown) {
        console.error("Error generating orientation classes:", error);
        const errMsg = error instanceof Error ? error.message : "Gagal membagi kelas orientasi.";
        return { success: false, error: errMsg };
    }
}

export async function moveStudentToClass({
    studentId,
    targetClassId,
}: {
    studentId: string;
    targetClassId: string | null;
}) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        await db.student.update({
            where: { id: studentId },
            data: { orientationClassId: targetClassId },
        });

        revalidatePath("/admin/classes");
        return { success: true, message: "Berhasil memindahkan siswa" };
    } catch (error: unknown) {
        console.error("Error moving student to class:", error);
        return { success: false, error: "Gagal memindahkan siswa" };
    }
}

export async function resetOrientationClasses(academicYear?: string) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const settings = await db.schoolSettings.findFirst();
        const targetYear = academicYear && academicYear !== "all" ? academicYear : (settings?.academicYear || "2026/2027");

        await db.$transaction(async (tx) => {
            await tx.student.updateMany({
                where: { academicYear: targetYear },
                data: { orientationClassId: null },
            });

            await tx.orientationClass.deleteMany({
                where: { academicYear: targetYear },
            });
        });

        revalidatePath("/admin/classes");
        return { success: true, message: "Berhasil mereset pembagian kelas." };
    } catch (error: unknown) {
        console.error("Error resetting orientation classes:", error);
        return { success: false, error: "Gagal mereset kelas." };
    }
}
