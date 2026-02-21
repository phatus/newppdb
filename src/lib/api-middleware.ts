import { NextResponse } from "next/server";
import { verifyApiToken } from "./auth-api";

export async function withAuth(req: Request, handler: (req: Request, session: any) => Promise<NextResponse>) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const session = await verifyApiToken(token);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    return await handler(req, session);
}
