"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/audit";

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: "INFO" | "WARNING" | "IMPORTANT";
    target: "ALL" | "USER" | "VERIFIED";
    isActive: boolean;
    createdAt: Date;
    authorId: string;
}

export async function getAnnouncements(isAdmin = false) {
    try {
        let query = `SELECT * FROM "Announcement" WHERE 1=1`;

        if (!isAdmin) {
            query += ` AND "isActive" = true`;
        }

        query += ` ORDER BY "createdAt" DESC`;

        const data = await db.$queryRawUnsafe(query) as any[];

        // Map to ensure types (dates usually come as strings or Date objects depending on driver)
        return data.map(item => ({
            ...item,
            isActive: item.isActive === true || item.isActive === 1, // Postgres bool might be strict
        })) as Announcement[];
    } catch (error) {
        console.error("Error fetching announcements:", error);
        return [];
    }
}

export async function createAnnouncement(data: {
    title: string;
    content: string;
    type: string;
    target: string;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return { success: false, error: "Unauthorized" };
        }

        // We need the user ID. Since session might not have it depending on auth config, 
        // we might need to fetch it or rely on session.user.id if configured.
        // Assuming session.user.email is available, let's fetch ID via Raw Query too to be safe?
        // Or trust 'db.user.findUnique' works for OLD tables? YES. User table is old.
        const user = await db.user.findUnique({ where: { email: session.user.email! } });
        if (!user) return { success: false, error: "User not found" };

        const id = crypto.randomUUID(); // Generate ID manually
        const now = new Date().toISOString();

        // RAW INSERT
        // Note: Postgres strings must be single quoted. We use parameterized query via executeRawUnsafe properly if possible?
        // $executeRawUnsafe supports params array.
        const query = `
            INSERT INTO "Announcement" ("id", "title", "content", "type", "target", "isActive", "authorId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        await db.$executeRawUnsafe(
            query,
            id,
            data.title,
            data.content,
            data.type,
            data.target,
            true,
            user.id,
            now,
            now
        );


        await logActivity("CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", id, `Title: ${data.title}, Type: ${data.type}`);

        revalidatePath("/admin/announcements");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, error: "Gagal membuat pengumuman" };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        await db.$executeRawUnsafe(`DELETE FROM "Announcement" WHERE "id" = $1`, id);

        await logActivity("DELETE_ANNOUNCEMENT", "ANNOUNCEMENT", id, "Deleted by admin");

        revalidatePath("/admin/announcements");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: "Gagal menghapus" };
    }
}

export async function toggleAnnouncement(id: string, currentState: boolean) {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.role !== "ADMIN") return { success: false, error: "Unauthorized" };

        // Toggle
        const newState = !currentState;

        await db.$executeRawUnsafe(
            `UPDATE "Announcement" SET "isActive" = $1 WHERE "id" = $2`,
            newState,
            id
        );

        await logActivity("TOGGLE_ANNOUNCEMENT", "ANNOUNCEMENT", id, `Result State: ${newState}`);

        revalidatePath("/admin/announcements");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Error toggling announcement:", error);
        return { success: false, error: "Gagal mengubah status" };
    }
}
