"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export async function getWaves() {
    try {
        const waves = await db.wave.findMany({
            orderBy: { startDate: 'asc' },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });
        return { success: true, data: waves };
    } catch (error) {
        console.error("Error fetching waves:", error);
        return { success: false, error: "Gagal mengambil data gelombang" };
    }
}

export async function createWave(data: {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    jalurAllowed: string[];
    isActive?: boolean;
}) {
    try {
        // Validation: End date must be after start date
        if (new Date(data.endDate) <= new Date(data.startDate)) {
            return { success: false, error: "Tanggal selesai harus setelah tanggal mulai" };
        }

        const wave = await db.wave.create({
            data: {
                name: data.name,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                jalurAllowed: data.jalurAllowed as Prisma.InputJsonValue,
                isActive: data.isActive ?? true,
            }
        });

        revalidatePath("/admin/settings/waves");
        await logActivity("CREATE_WAVE", "SETTINGS", wave.id, `Created wave: ${wave.name}`);

        return { success: true, data: wave };
    } catch (error) {
        console.error("Error creating wave:", error);
        return { success: false, error: "Gagal membuat gelombang" };
    }
}

export async function updateWave(id: string, data: {
    name?: string;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    jalurAllowed?: string[];
    isActive?: boolean;
}) {
    try {
        if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
            return { success: false, error: "Tanggal selesai harus setelah tanggal mulai" };
        }

        // Handle Json type cast for jalurAllowed
        const updateData: any = { ...data };
        if (data.jalurAllowed) {
            updateData.jalurAllowed = data.jalurAllowed as Prisma.InputJsonValue;
        }

        const wave = await db.wave.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/settings/waves");
        await logActivity("UPDATE_WAVE", "SETTINGS", wave.id, `Updated wave: ${wave.name}`);

        return { success: true, data: wave };
    } catch (error) {
        console.error("Error updating wave:", error);
        return { success: false, error: "Gagal mengupdate gelombang" };
    }
}

export async function deleteWave(id: string) {
    try {
        await db.wave.delete({ where: { id } });

        revalidatePath("/admin/settings/waves");
        await logActivity("DELETE_WAVE", "SETTINGS", id, "Deleted wave");

        return { success: true };
    } catch (error) {
        console.error("Error deleting wave:", error);
        return { success: false, error: "Gagal menghapus gelombang" };
    }
}

export async function getActiveWave() {
    try {
        const now = new Date();
        const activeWave = await db.wave.findFirst({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });
        return activeWave;
    } catch (error) {
        return null;
    }
}
