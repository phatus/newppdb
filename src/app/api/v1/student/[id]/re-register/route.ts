import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware";
import { reRegisterStudent } from "@/app/actions/student-re-registration";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    return withAuth(req, async (req, session) => {
        try {
            const body = await req.json();
            const { newJalur } = body;

            if (!newJalur) {
                return NextResponse.json(
                    { message: "Jalur pendaftaran baru harus dipilih" },
                    { status: 400 }
                );
            }

            const result = await reRegisterStudent(params.id, { newJalur });

            if (result.success) {
                return NextResponse.json({
                    message: "Pendaftaran ulang berhasil dilakukan",
                });
            } else {
                return NextResponse.json(
                    { message: result.error || "Gagal melakukan pendaftaran ulang" },
                    { status: 400 }
                );
            }
        } catch (error: any) {
            console.error("API Re-registration Error:", error);
            return NextResponse.json(
                { message: error.message || "Internal server error" },
                { status: 500 }
            );
        }
    });
}
