import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { createApiToken } from "@/lib/auth-api";
import { logActivity } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email dan password wajib diisi" },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: "Email tidak terdaftar" },
                { status: 401 }
            );
        }

        if (!user.password) {
            return NextResponse.json(
                { message: "Akun ini menggunakan login Google. Silakan login melalui web." },
                { status: 401 }
            );
        }

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Password salah" },
                { status: 401 }
            );
        }

        if (!user.emailVerified) {
            return NextResponse.json(
                { message: "Email belum diverifikasi. Silakan cek inbox Anda." },
                { status: 403 }
            );
        }

        // Create token
        const tokenPayload = {
            id: user.id,
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const token = await createApiToken(tokenPayload);

        await logActivity("LOGIN", "USER", user.id, `User logged in via API: ${user.email}`, user.id);

        return NextResponse.json({
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("API Login Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server" },
            { status: 500 }
        );
    }
}
