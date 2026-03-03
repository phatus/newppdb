"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUsers() {
    try {
        // Fetch users who are ADMIN or regular USERs (excluding students if they share table, but usually User table is for auth)
        const users = await db.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
            }
        });
        return users;
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function createUser(data: { email: string; password: string; role: "ADMIN" | "USER" }) {
    try {
        const existingUser = await db.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            return { success: false, error: "Email sudah terdaftar" };
        }

        const hashedPassword = await hash(data.password, 12);

        await db.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: data.role,
            }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error: "Gagal membuat user" };
    }
}

export async function deleteUser(userId: string) {
    try {
        // Check if user exists first
        const user = await db.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return { success: false, error: "User tidak ditemukan" };
        }

        // Schema has onDelete: Cascade on:
        // Account -> User, Session -> User, Student -> User (cascades to Documents, Grades, etc.)
        // AuditLog -> User (Cascade), Announcement -> User (Cascade)
        // So we just need to delete the user, and everything cascades.
        await db.user.delete({
            where: { id: userId }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return { success: false, error: error.message || "Gagal menghapus user" };
    }
}


export async function updateUser(userId: string, data: { role: "ADMIN" | "USER"; password?: string }) {
    try {
        const updateData: any = {
            role: data.role,
        };

        if (data.password && data.password.trim() !== "") {
            updateData.password = await hash(data.password, 12);
        }

        await db.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Gagal mengupdate user" };
    }
}
export async function updateHeartbeat() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return { success: false };

        await db.user.update({
            where: { email: session.user.email },
            data: { lastSeen: new Date() }
        });

        return { success: true };
    } catch (error) {
        console.error("Error updating heartbeat:", error);
        return { success: false };
    }
}

export async function getOnlineUserCount() {
    try {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const count = await db.user.count({
            where: {
                lastSeen: {
                    gte: fiveMinutesAgo
                }
            }
        });
        return count;
    } catch (error) {
        console.error("Error fetching online count:", error);
        return 0;
    }
}

export async function updateProfile(data: { name?: string; password?: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.password && data.password.trim() !== "") {
            updateData.password = await hash(data.password, 12);
        }

        await db.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        revalidatePath("/dashboard/profile");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { success: false, error: "Gagal mengupdate profil" };
    }
}

