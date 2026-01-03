"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Semester } from "@prisma/client";

export async function getSemesters() {
    try {
        const semesters = await db.semester.findMany({
            orderBy: {
                order: "asc",
            },
        });
        return { success: true, data: semesters };
    } catch (error) {
        console.error("Error fetching semesters:", error);
        return { success: false, error: "Gagal mengambil data semester" };
    }
}

export async function createSemester(data: { name: string; order: number }) {
    try {
        await db.semester.create({
            data: {
                name: data.name,
                order: data.order,
                isActive: true,
            },
        });
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal membuat semester" };
    }
}

export async function updateSemester(id: string, data: { name: string; order: number }) {
    try {
        await db.semester.update({
            where: { id },
            data: {
                name: data.name,
                order: data.order,
            },
        });
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal update semester" };
    }
}

export async function toggleSemesterActive(id: string, currentStatus: boolean) {
    try {
        await db.semester.update({
            where: { id },
            data: { isActive: !currentStatus },
        });
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal mengubah status" };
    }
}

export async function deleteSemester(id: string) {
    try {
        // Check if related grades exist
        const relatedGrades = await db.semesterGrade.count({
            where: { semesterId: id },
        });

        if (relatedGrades > 0) {
            return {
                success: false,
                error: "Tidak dapat menghapus semester karena sudah ada nilai siswa yang terkait.",
            };
        }

        await db.semester.delete({
            where: { id },
        });
        revalidatePath("/admin/subjects");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Gagal menghapus semester" };
    }
}
