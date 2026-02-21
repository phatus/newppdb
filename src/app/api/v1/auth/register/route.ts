import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { logActivity } from "@/lib/audit";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email dan password wajib diisi" },
                { status: 400 }
            );
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "Email sudah terdaftar. Silakan login." },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 12);

        // Verification token logic matching the main register route
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await db.user.create({
            data: {
                email,
                name: name || email.split('@')[0],
                password: hashedPassword,
                role: "USER",
                verificationToken,
                verificationTokenExpiry,
                emailVerified: null,
            },
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (mailError) {
            console.error("API Register Mail Error:", mailError);
        }

        await logActivity("REGISTER_USER", "USER", user.id, `User registered via Mobile API: ${email}`, user.id);

        return NextResponse.json(
            {
                message: "Registrasi berhasil. Silakan cek inbox email Anda untuk verifikasi.",
                user: { id: user.id, email: user.email }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("API Registration error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada server" },
            { status: 500 }
        );
    }
}
