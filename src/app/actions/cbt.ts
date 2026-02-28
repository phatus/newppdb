"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCbtExportData(waveId?: string) {
    try {
        const whereClause: any = {
            statusVerifikasi: "VERIFIED",
            nomorUjian: { not: null },
        };

        if (waveId && waveId !== "all") {
            whereClause.waveId = waveId;
        }

        const students = await db.student.findMany({
            where: whereClause,
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
