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
                const keys = ["fileAkta", "fileKK", "fileSKL", "fileRaport", "pasFoto", "fileSKTM"];
                keys.forEach(key => {
                    const url = (docs as any)[key];
                    if (url) allFiles.push(url);
                });

                if (docs.filePrestasi && Array.isArray(docs.filePrestasi)) {
                    allFiles.push(...docs.filePrestasi);
                }
            }
        });

        // Delete physical files
        if (allFiles.length > 0) {
            await deleteFiles(allFiles);
        }

        // Delete students
        // Note: Use transaction if dependent records need explicit cleanup, 
        // buy typically onDelete: Cascade handles it.
        await db.student.deleteMany({
            where: {
                id: {
                    in: studentIds,
                },
            },
        });

        // Also delete associated users if needed? 
        // Usually, Student is linked to a User. If we delete the Student, the User account might remain.
        // For a full cleanup, we might want to delete the User as well if the Student is the only purpose.
        // However, based on the schema `Student` has `userId`. 
        // If we want to fully remove access, we should probably delete the User too.
        // Let's check the schema logic: User -> Student (1:M or 1:1 implies mostly 1:1 in this context).
        // For now, let's strictly follow "Delete Student" request. 
        // If the user request implies deleting the "Registrant Account", we might need to delete the User.
        // Looking at `actions/users.ts` might give a clue, but let's stick to deleting the Student record first.
        // Actually, preventing orphaned users is good practice. 
        // Let's look at `deleteMany` returns. It's just a count.

        // REVISION: The UI lists "Students". If we delete the student profile, the user can still login but has no profile.
        // That might be confusing. 
        // BUT, often "Delete Student" implies removing the application data.
        // Let's stick to deleting the Student entity for now to be safe, unless otherwise specified.

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
                const keys = ["fileAkta", "fileKK", "fileSKL", "fileRaport", "pasFoto", "fileSKTM"];
                keys.forEach(key => {
                    const url = (docs as any)[key];
                    if (url) allFiles.push(url);
                });

                if (docs.filePrestasi && Array.isArray(docs.filePrestasi)) {
                    allFiles.push(...docs.filePrestasi);
                }
            }
        });

        // Delete physical files
        if (allFiles.length > 0) {
            await deleteFiles(allFiles);
        }

        await db.student.deleteMany({});

        revalidatePath("/admin/students");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting all students:", error);
        return { success: false, error: error.message };
    }
}
