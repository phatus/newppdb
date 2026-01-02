import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json({ message: "Token tidak ditemukan" }, { status: 400 });
        }

        const user = await db.user.findFirst({
            where: {
                verificationToken: token,
                verificationTokenExpiry: {
                    gt: new Date(),
                },
            },
        });

        if (!user) {
            return NextResponse.json({ message: "Token tidak valid atau sudah kadaluarsa" }, { status: 400 });
        }

        await db.user.update({
            where: { id: user.id },
            data: {
                emailVerified: new Date(),
                verificationToken: null,
                verificationTokenExpiry: null,
            },
        });

        return NextResponse.json({ message: "Email berhasil diverifikasi" }, { status: 200 });

    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ message: "Terjadi kesalahan internal" }, { status: 500 });
    }
}
