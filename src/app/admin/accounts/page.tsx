import { db } from "@/lib/db";
import UserManagement from "@/components/admin/settings/UserManagement";
import ExportCbtButton from "@/components/admin/ExportCbtButton";
import PhotoExportButton from "@/components/admin/PhotoExportButton";

export default async function AccountsPage() {
    // Fetch users for the management component
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Akun</h1>
                    <p className="text-slate-500 dark:text-slate-400">Kelola akun pengguna administrator dan pendaftar.</p>
                </div>
                <div className="flex gap-3">
                    <ExportCbtButton />
                    <PhotoExportButton />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                {/* Reusing existing component */}
                <UserManagement initialUsers={users} />
            </div>
        </div >
    );
}
