import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 12);

        // Generate verification token (simple random string for now)
        const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                role: role === "ADMIN" ? "ADMIN" : "USER",

                verificationToken,
                verificationTokenExpiry,
                emailVerified: null, // Explicitly null
            },
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, verificationToken);
        } catch (mailError) {
            console.error("Failed to send email:", mailError);
        }

        return NextResponse.json(
            {
                message: "Registrasi berhasil. Silakan cek inbox email Anda untuk verifikasi.",
                user: { id: user.id, email: user.email }
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
