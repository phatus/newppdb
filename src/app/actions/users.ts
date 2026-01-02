"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";

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
        await db.user.delete({
            where: { id: userId }
        });

        revalidatePath("/admin/settings");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: "Gagal menghapus user" };
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
