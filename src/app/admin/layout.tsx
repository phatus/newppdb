import { db } from "@/lib/db";
import AdminLayoutShell from "@/components/admin/AdminLayoutShell";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const settings = await db.schoolSettings.findFirst();
    const schoolName = settings?.schoolName || "PPDB Admin MTsN 1 Pacitan";
    const schoolLogo = settings?.schoolLogo || "/uploads/school_logo_1767362065250.png";

    return (
        <AdminLayoutShell schoolName={schoolName} schoolLogo={schoolLogo}>
            {children}
        </AdminLayoutShell>
    );
}
