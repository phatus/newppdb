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
    quota?: number;
    pathQuotas?: any;
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
                quota: data.quota ?? 0,
                pathQuotas: data.pathQuotas as Prisma.InputJsonValue,
                isActive: data.isActive ?? true,
            }
        });

        revalidatePath("/admin/settings/waves");
        await logActivity("CREATE_WAVE", "WAVE", wave.id, `Created wave: ${wave.name}`);

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
    quota?: number;
    pathQuotas?: any;
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
        if (data.pathQuotas) {
            updateData.pathQuotas = data.pathQuotas as Prisma.InputJsonValue;
        }

        const wave = await db.wave.update({
            where: { id },
            data: updateData
        });

        revalidatePath("/admin/settings/waves");
        await logActivity("UPDATE_WAVE", "WAVE", wave.id, `Updated wave: ${wave.name}`);

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
        await logActivity("DELETE_WAVE", "WAVE", id, "Deleted wave");

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

/**
 * Gets the next wave that is marked active, even if it hasn't started yet.
 * Used for students who failed and want to pre-emptively register for the next round.
 */
export async function getNextWave(currentWaveId?: string | null) {
    try {
        const now = new Date();
        // Priority 1: Wave that is actually currently active (by date)
        const currentActive = await getActiveWave();

        if (currentActive && currentActive.id !== currentWaveId) {
            return currentActive;
        }

        // Priority 2: Next wave that is marked isActive and starts in the future
        const nextWave = await db.wave.findFirst({
            where: {
                isActive: true,
                id: currentWaveId ? { not: currentWaveId } : undefined,
                startDate: { gt: now }
            },
            orderBy: { startDate: 'asc' }
        });

        return nextWave;
    } catch (error) {
        return null;
    }
}
