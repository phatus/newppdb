import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import ProfilePage from "@/components/dashboard/ProfilePage";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/auth/login");
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        }
    });

    if (!user) {
        redirect("/auth/login");
    }

    return <ProfilePage user={user} />;
}
