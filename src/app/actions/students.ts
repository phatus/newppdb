"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to check admin role
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required.");
    }
    return session;
}

import { deleteFiles } from "@/lib/file-utils";
import { logActivity } from "@/lib/audit";

export async function deleteStudents(studentIds: string[]) {
    try {
        await checkAdmin();

        if (!studentIds || studentIds.length === 0) {
            return { success: false, error: "No students selected." };
        }

        // Fetch students and their documents to delete physical files
        const studentsToDelete = await db.student.findMany({
            where: {
                id: { in: studentIds }
            },
            include: {
                documents: true
            }
        });

        // Collect all file URLs
        const allFiles: string[] = [];
        studentsToDelete.forEach(student => {
            if (student.documents) {
                const docs = student.documents;
                const keys = ["fileAkta", "fileKK", "fileRaport", "pasFoto", "fileSKTM"];
                keys.forEach(key => {
                    const url = (docs as any)[key];
                    if (url) allFiles.push(url);
                });

                if (docs.filePrestasi && Array.isArray(docs.filePrestasi)) {
                    allFiles.push(...docs.filePrestasi);
                }
            }
        });

        // Collect User IDs to delete as well
        const userIds = studentsToDelete.map(s => s.userId);

        // Delete physical files
        if (allFiles.length > 0) {
            await deleteFiles(allFiles);
        }

        // Use transaction to ensure everything is deleted correctly
        await db.$transaction(async (tx) => {
            // 1. Delete the specific students first
            await tx.student.deleteMany({
                where: {
                    id: { in: studentIds },
                },
            });

            // 2. Safely clean up user accounts only if they have no other students left
            // Using a loop within transaction to check counts for each affected user
            const distinctUserIds = [...new Set(userIds)];
            for (const userId of distinctUserIds) {
                const remainingCount = await tx.student.count({
                    where: { userId: userId }
                });

                if (remainingCount === 0) {
                    await tx.user.deleteMany({
                        where: {
                            id: userId,
                            role: { not: "ADMIN" }
                        }
                    });
                }
            }
        });

        await logActivity(
            "DELETE_STUDENT",
            "STUDENT",
            studentIds.length === 1 ? studentIds[0] : "MULTIPLE",
            `Deleted ${studentIds.length} students: ${studentsToDelete.map(s => s.namaLengkap).join(", ")}`
        );

        revalidatePath("/admin/students");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting students:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAllStudents() {
    try {
        await checkAdmin();

        // Fetch all students and their documents to delete physical files
        const allStudents = await db.student.findMany({
            include: {
                documents: true
            }
        });

        // Collect all file URLs
        const allFiles: string[] = [];
        allStudents.forEach(student => {
            if (student.documents) {
                const docs = student.documents;
                const keys = ["fileAkta", "fileKK", "fileRaport", "pasFoto", "fileSKTM"];
                keys.forEach(key => {
                    const url = (docs as any)[key];
                    if (url) allFiles.push(url);
                });

                if (docs.filePrestasi && Array.isArray(docs.filePrestasi)) {
                    allFiles.push(...docs.filePrestasi);
                }
            }
        });

        // Collect all student user IDs
        const userIds = allStudents.map(s => s.userId);

        // Delete physical files
        if (allFiles.length > 0) {
            await deleteFiles(allFiles);
        }

        await db.$transaction(async (tx) => {
            // 1. Delete all students
            await tx.student.deleteMany({});

            // 2. Delete all users who are not ADMIN (they are definitely orphans now)
            await tx.user.deleteMany({
                where: {
                    role: { not: "ADMIN" }
                }
            });
        });

        await logActivity(
            "DELETE_ALL_STUDENTS",
            "STUDENT",
            "ALL",
            `Deleted ALL ${allStudents.length} students from the database.`
        );

        revalidatePath("/admin/students");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting all students:", error);
        return { success: false, error: error.message };
    }
}

export async function updateStudentBio(studentId: string, data: any) {
    try {
        await checkAdmin();

        const updatedStudent = await db.student.update({
            where: { id: studentId },
            data: {
                namaLengkap: data.namaLengkap,
                nisn: data.nisn,
                nik: data.nik,
                noKk: data.noKk,
                gender: data.gender,
                tempatLahir: data.tempatLahir,
                tanggalLahir: data.tanggalLahir ? new Date(data.tanggalLahir) : null,
                jenjang: data.jenjang,
                asalSekolah: data.asalSekolah,
                alamatJalan: data.alamatJalan,
                alamatRt: data.alamatRt,
                alamatRw: data.alamatRw,
                alamatDesa: data.alamatDesa,
                alamatKecamatan: data.alamatKecamatan,
                alamatKabupaten: data.alamatKabupaten,
                alamatProvinsi: data.alamatProvinsi,
                kodePos: data.kodePos,
                telepon: data.telepon,
                jalur: data.jalur,
            }
        });

        await logActivity(
            "UPDATE_STUDENT_BIO",
            "STUDENT",
            studentId,
            `Updated bio data for student: ${updatedStudent.namaLengkap}`
        );

        revalidatePath(`/admin/verification/${studentId}`);
        revalidatePath("/admin/verification");

        return { success: true, student: updatedStudent };
    } catch (error: any) {
        console.error("Error updating student bio:", error);
        return { success: false, error: error.message };
    }
}
export async function getStudentsForExport(filters: {
    q?: string;
    jalur?: string;
    status?: string;
    waveId?: string;
    dokumen?: string;
}) {
    try {
        await checkAdmin();

        const whereClause: any = {};

        if (filters.q) {
            whereClause.OR = [
                { namaLengkap: { contains: filters.q, mode: "insensitive" } },
                { nisn: { contains: filters.q } },
                { asalSekolah: { contains: filters.q, mode: "insensitive" } },
            ];
        }

        if (filters.jalur) {
            whereClause.jalur = filters.jalur as any;
        }

        if (filters.status) {
            whereClause.statusVerifikasi = filters.status as any;
        }

        if (filters.waveId && filters.waveId !== "all") {
            whereClause.waveId = filters.waveId;
        }

        const completeBiodataFields = [
            { namaLengkap: { not: "" } },
            { nisn: { not: "" } },
        ];

        const docsLengkapFilter = [
            { documents: { AND: [{ fileKK: { not: null } }, { fileKK: { not: "" } }] } },
            { documents: { AND: [{ fileAkta: { not: null } }, { fileAkta: { not: "" } }] } },
            { documents: { AND: [{ pasFoto: { not: null } }, { pasFoto: { not: "" } }] } },
            { documents: { AND: [{ fileRaport: { not: null } }, { fileRaport: { not: "" } }] } },
        ];
        const gradesLengkapFilter = [
            { grades: { semesterGrades: { some: {} } } },
        ];

        if (filters.dokumen === "LENGKAP") {
            whereClause.AND = [
                ...completeBiodataFields,
                ...docsLengkapFilter,
                ...gradesLengkapFilter,
            ];
        } else if (filters.dokumen === "BELUM_LENGKAP") {
            whereClause.NOT = {
                AND: [
                    ...completeBiodataFields,
                    ...docsLengkapFilter,
                    ...gradesLengkapFilter,
                ],
            };
        }

        const students = await db.student.findMany({
            where: whereClause,
            include: {
                user: true,
                wave: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, students };
    } catch (error: any) {
        console.error("Error fetching students for export:", error);
        return { success: false, error: error.message };
    }
}
