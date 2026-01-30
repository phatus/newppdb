import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import { Suspense } from "react";

export default async function VerificationListPage({
    searchParams,
}: {
    searchParams: Promise<{ q: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";

    const whereClause = query
        ? {
            OR: [
                { namaLengkap: { contains: query, mode: "insensitive" } },
                { nisn: { contains: query } },
            ],
        }
        : {};

    const students = await db.student.findMany({
        where: whereClause as any,
        orderBy: {
            createdAt: "desc"
        },
        include: {
            documents: true
        }
    });

    const pendingCount = students.filter((s: any) => s.statusVerifikasi === "PENDING").length;
    const verifiedCount = students.filter((s: any) => s.statusVerifikasi === "VERIFIED").length;
    const rejectedCount = students.filter((s: any) => s.statusVerifikasi === "REJECTED").length;

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Verifikasi Dokumen
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Daftar murid yang menunggu validasi dokumen.
                    </p>
                </div>
            </div>

            {/* Stats/Filter Bar */}
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-bold flex items-center gap-2">
                        Pending <span className="bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-xs">{pendingCount}</span>
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Terverifikasi <span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded text-xs ml-1">{verifiedCount}</span>
                    </button>
                    <button className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                        Ditolak <span className="bg-red-100 text-red-500 px-1.5 py-0.5 rounded text-xs ml-1">{rejectedCount}</span>
                    </button>
                </div>
                <Suspense fallback={<div className="w-full sm:w-72 h-10 bg-slate-100 rounded-lg animate-pulse" />}>
                    <SearchInput />
                </Suspense>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student: any) => (
                    <div key={student.id} className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">person</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{student.namaLengkap}</h3>
                                    <p className="text-xs text-slate-500">NISN: {student.nisn}</p>
                                </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${student.statusVerifikasi === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                                student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                {student.statusVerifikasi || 'PENDING'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-3">
                            <div className="flex justify-between">
                                <span>Jalur:</span>
                                <span className="font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{student.jalur?.replace('_', ' ') || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tgl Daftar:</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {new Date(student.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                        <Link href={`/admin/verification/${student.id}`} className="mt-2 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg font-bold text-sm transition-all">
                            <span className="material-symbols-outlined text-[18px]">edit_document</span>
                            Verifikasi Sekarang
                        </Link>
                    </div>
                ))}

                {students.length === 0 && (
                    <div className="col-span-full p-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
                        <p>Belum ada data murid yang perlu diverifikasi.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
