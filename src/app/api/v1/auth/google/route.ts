import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { db } from "@/lib/db";
import { createApiToken } from "@/lib/auth-api";
import { logActivity } from "@/lib/audit";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ message: "ID Token is required" }, { status: 400 });
        }

        // Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return NextResponse.json({ message: "Invalid Google Token" }, { status: 401 });
        }

        const email = payload.email;
        const name = payload.name || email.split('@')[0];

        // Find or Create user
        let user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Create user for Google Login (Auto-verified)
            user = await db.user.create({
                data: {
                    email,
                    name,
                    role: "USER",
                    emailVerified: new Date(), // Google accounts are pre-verified
                },
            });
            await logActivity("REGISTER_USER", "USER", user.id, `User registered via Google Mobile API: ${email}`, user.id);
        }

        // Create token for mobile
        const tokenPayload = {
            id: user.id,
            sub: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        };

        const token = await createApiToken(tokenPayload);

        await logActivity("LOGIN", "USER", user.id, `User logged in via Google Mobile API: ${user.email}`, user.id);

        return NextResponse.json({
            message: "Login Google berhasil",
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        });

    } catch (error) {
        console.error("API Google Auth Error:", error);
        return NextResponse.json(
            { message: "Terjadi kesalahan pada login Google" },
            { status: 500 }
        );
    }
}
