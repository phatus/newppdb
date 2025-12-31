import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardShell from "@/components/DashboardShell";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login");
    }

    const user = {
        name: session.user?.email || "Pengguna", // Fallback name for now, ideally fetch real name
        email: session.user?.email || "",
        role: session.user?.role === "ADMIN" ? "Administrator" : "Panel Orang Tua", // Custom role text based on HTML design
        image: session.user?.image,
    };

    return (
        <DashboardShell user={user}>
            {children}
        </DashboardShell>
    );
}
