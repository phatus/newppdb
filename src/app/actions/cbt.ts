"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCbtExportData() {
    try {
        const students = await db.student.findMany({
            where: {
                statusVerifikasi: "VERIFIED",
                nomorUjian: { not: null }, // Only students with exam numbers
            },
            select: {
                nomorUjian: true,
                namaLengkap: true,
                passwordCbt: true,
            },
            orderBy: {
                nomorUjian: 'asc'
            }
        });

        // Format for consistent consumption
        return students.map(s => ({
            username: s.nomorUjian || "",
            password: s.passwordCbt || "",
            fullname: s.namaLengkap
        }));

    } catch (error) {
        console.error("Error fetching CBT export data:", error);
        return [];
    }
}
