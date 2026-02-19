import { db } from "@/lib/db";
import { Suspense } from "react";
import { formatInWIB } from "@/lib/date-utils";

// Server action or direct DB call since this is a server component
async function getLogs() {
    try {
        // Raw SQL Join
        const logs = await db.$queryRawUnsafe(`
            SELECT a.*, u."email", u."role"
            FROM "AuditLog" a
            LEFT JOIN "User" u ON a."userId" = u."id"
            ORDER BY a."createdAt" DESC
            LIMIT 100
        `) as any[];

        return logs.map(log => ({
            ...log,
            // Parse dates manually if needed, usually Prisma raw returns Date objects for timestamp columns
        }));
    } catch (e) {
        console.error("Error fetching logs", e);
        return [];
    }
}

export default async function AuditLogsPage() {
    const logs = await getLogs();

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Audit Logs (Aktivitas Sistem)
                </h1>
                <p className="text-slate-500 text-sm">
                    Memantau 100 aktivitas terakhir pengguna.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-3">Waktu</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Aksi</th>
                                <th className="px-6 py-3">Entitas</th>
                                <th className="px-6 py-3">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        Belum ada aktivitas tercatat.
                                    </td>
                                </tr>
                            ) : logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                        {formatInWIB(log.createdAt)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900 dark:text-white">{log.email}</span>
                                            <span className="text-xs text-slate-500">{log.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                                            ${log.action.includes('DELETE') || log.action.includes('REJECT') ? 'bg-red-100 text-red-700' :
                                                log.action.includes('UPDATE') || log.action.includes('EDIT') ? 'bg-blue-100 text-blue-700' :
                                                    'bg-emerald-100 text-emerald-700'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                                            {log.entity}
                                        </span>
                                        {log.entityId && (
                                            <span className="text-xs text-slate-400 block mt-1 font-mono max-w-[100px] truncate" title={log.entityId}>
                                                #{log.entityId}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <p className="truncate text-slate-600 dark:text-slate-400 text-xs" title={log.details}>
                                            {log.details}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
