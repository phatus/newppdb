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
                // We need ID. Use findFirst with insensitive mode to handle case differences
                const user = await db.user.findFirst({
                    where: {
                        email: {
                            equals: session.user.email,
                            mode: 'insensitive'
                        }
                    }
                });
                actorId = user?.id;
            }
        }

        // Fallback: If still no actorId, try to find ANY admin to attribute (system action)
        if (!actorId) {
            const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
            actorId = admin?.id;
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
