"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSubjects() {
    try {
        const subjects = await db.subject.findMany({
            orderBy: { order: 'asc' }
        });
        return { success: true, data: subjects };
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return { success: false, data: [] };
    }
}

export async function createSubject(data: { name: string; category: string; order: number }) {
    try {
        await db.subject.create({
            data: {
                name: data.name,
                category: data.category,
                order: data.order,
                isActive: true
            }
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/dashboard"); // Affects grade input
        return { success: true };
    } catch (error) {
        console.error("Error creating subject:", error);
        return { success: false, error: "Gagal membuat mata pelajaran." };
    }
}

export async function updateSubject(id: string, data: { name: string; category: string; order: number }) {
    try {
        await db.subject.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                order: data.order
            }
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error updating subject:", error);
        return { success: false, error: "Gagal mengupdate mata pelajaran." };
    }
}

export async function toggleSubjectActive(id: string, currentStatus: boolean) {
    try {
        await db.subject.update({
            where: { id },
            data: {
                isActive: !currentStatus
            }
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error toggling subject:", error);
        return { success: false, error: "Gagal mengubah status mata pelajaran." };
    }
}

export async function deleteSubject(id: string) {
    try {
        // Soft delete logic can be applied here, but for now hard delete if permitted by FK constraints?
        // Grades might be linked. Ideally we just disable it.
        // But if user insists on delete, we should check constraints.
        // Prisma cascade delete is on entries, so be careful. 
        // For now, let's stick to simple delete and let Prisma handle errors if related data exists
        // Actually, schema has `entries GradeEntry[]`
        // If we delete subject, `GradeEntry` will fail if not cascade?
        // Wait, schema: `subject Subject @relation(fields: [subjectId], references: [id])` - No Cascade specified on this relation side usually implies Restrict.
        // Let's rely on toggleActive primarily, but allow delete if no data.

        await db.subject.delete({
            where: { id }
        });
        revalidatePath("/admin/subjects");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting subject:", error);
        return { success: false, error: "Gagal menghapus mata pelajaran. Mungkin sudah ada data nilai terkait." };
    }
}
