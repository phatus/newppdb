"use server";

import { db } from "@/lib/db";
import { hash } from "bcryptjs";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";

export async function forgotPassword(email: string) {
    try {
        const users: any[] = await db.$queryRawUnsafe(
            `SELECT * FROM "User" WHERE "email" = $1 LIMIT 1`,
            email
        );
        const user = users[0];

        if (!user) {
            return { success: true };
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await db.$executeRawUnsafe(
            `UPDATE "User" SET "resetPasswordToken" = $1, "resetPasswordTokenExpiry" = $2 WHERE "id" = $3`,
            token, expiry, user.id
        );

        await sendPasswordResetEmail(email, token);

        return { success: true };
    } catch (error) {
        console.error("Forgot password error:", error);
        return { success: false, error: "Gagal memproses permintaan reset password." };
    }
}

export async function resetPassword(token: string, password: string) {
    try {
        const users: any[] = await db.$queryRawUnsafe(
            `SELECT * FROM "User" WHERE "resetPasswordToken" = $1 AND "resetPasswordTokenExpiry" > $2 LIMIT 1`,
            token, new Date()
        );
        const user = users[0];

        if (!user) {
            return { success: false, error: "Token tidak valid atau sudah kedaluwarsa." };
        }

        const hashedPassword = await hash(password, 12);

        await db.$executeRawUnsafe(
            `UPDATE "User" SET "password" = $1, "resetPasswordToken" = NULL, "resetPasswordTokenExpiry" = NULL WHERE "id" = $2`,
            hashedPassword, user.id
        );

        return { success: true };
    } catch (error) {
        console.error("Reset password error:", error);
        return { success: false, error: "Gagal mereset password." };
    }
}



export async function resendVerificationEmail(email: string) {
    if (!email) {
        return { success: false, error: "Email wajib diisi" };
    }

    try {
        const users: any[] = await db.$queryRawUnsafe(
            `SELECT * FROM "User" WHERE "email" = $1 LIMIT 1`,
            email
        );
        const user = users[0];

        if (!user) {
            return { success: false, error: "Email belum didaftarkan" };
        }

        if (user.emailVerified) {
            return { success: false, error: "Akun sudah diverifikasi. Silakan login." };
        }

        const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        // 24 hours from now
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await db.$executeRawUnsafe(
            `UPDATE "User" SET "verificationToken" = $1, "verificationTokenExpiry" = $2 WHERE "id" = $3`,
            verificationToken, verificationTokenExpiry, user.id
        );

        await sendVerificationEmail(email, verificationToken);

        return { success: true, message: `Email verifikasi berhasil dikirim ke ${email}. Cek inbox/spam.` };

    } catch (error) {
        console.error("Resend verification error:", error);
        return { success: false, error: "Terjadi kesalahan sistem" };
    }
}
