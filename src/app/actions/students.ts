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
            // Delete students (cascades to Grades, RegistrationHistory, and Documents)
            await tx.student.deleteMany({
                where: {
                    id: { in: studentIds },
                },
            });

            // Delete associated users if they are not ADMINs (safety check)
            // This is to prevent leaving orphaned user accounts
            await tx.user.deleteMany({
                where: {
                    id: { in: userIds },
                    role: { not: "ADMIN" }
                }
            });
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
            // Delete all students
            await tx.student.deleteMany({});

            // Delete all users who are not ADMIN
            await tx.user.deleteMany({
                where: {
                    id: { in: userIds },
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
