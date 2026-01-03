"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getExamSchedules() {
    try {
        const schedules = await db.examSchedule.findMany({
            orderBy: { order: 'asc' }
        });
        return schedules;
    } catch (error) {
        console.error("Error fetching schedules:", error);
        return [];
    }
}

export async function createExamSchedule(data: {
    dayDate: string;
    time: string;
    subject: string;
    order: number;
}) {
    try {
        await db.examSchedule.create({
            data: {
                dayDate: data.dayDate,
                time: data.time,
                subject: data.subject,
                order: data.order
            }
        });
        revalidatePath("/admin/schedule");
        revalidatePath("/dashboard/student/exam-card");
        return { success: true };
    } catch (error) {
        console.error("Error creating schedule:", error);
        return { success: false, error: "Failed to create schedule" };
    }
}

export async function deleteExamSchedule(id: string) {
    try {
        await db.examSchedule.delete({ where: { id } });
        revalidatePath("/admin/schedule");
        revalidatePath("/dashboard/student/exam-card");
        return { success: true };
    } catch (error) {
        console.error("Error deleting schedule:", error);
        return { success: false, error: "Failed to delete schedule" };
    }
}
