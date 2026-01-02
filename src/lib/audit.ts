import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function logActivity(
    action: string,
    entity: string,
    entityId: string | null,
    details: string | object = "",
    userId?: string // Optional override
) {
    try {
        let actorId = userId;

        if (!actorId) {
            const session = await getServerSession(authOptions);
            if (session?.user?.email) {
                // We need ID. Since we are in Raw SQL mode mental model, let's try to get ID if needed,
                // but for performance, we might want to store User ID in session.
                // For now, fetch generic user.
                const user = await db.user.findUnique({ where: { email: session.user.email } });
                actorId = user?.id;
            }
        }

        if (!actorId) {
            console.warn("Audit Log: No user found for action", action);
            return;
        }

        const detailsString = typeof details === "object" ? JSON.stringify(details) : details;
        const id = crypto.randomUUID();
        const now = new Date().toISOString();

        // Raw SQL Insert
        await db.$executeRawUnsafe(`
            INSERT INTO "AuditLog" ("id", "action", "entity", "entityId", "details", "userId", "createdAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, id, action, entity, entityId, detailsString, actorId, now);

    } catch (error) {
        console.error("Failed to write audit log:", error);
        // Don't throw, we don't want to break the main app flow if logging fails
    }
}
