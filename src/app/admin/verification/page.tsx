import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import WaveSelector from "@/components/admin/WaveSelector";
import VerificationStatusFilter from "@/components/admin/VerificationStatusFilter";
import PaginationControl from "@/components/admin/PaginationControl";
import { Suspense } from "react";
import { formatInWIB } from "@/lib/date-utils";
import { getFileUrl } from "@/lib/file-utils";

const PAGE_SIZE = 12;

export default async function VerificationListPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; waveId?: string; status?: string; page?: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";
    const waveId = resolvedParams?.waveId;
    const status = resolvedParams?.status;
    const currentPage = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Base where clause (untuk search & wave)
    const baseWhere: any = {};
    if (query) {
        baseWhere.OR = [
            { namaLengkap: { contains: query, mode: "insensitive" } },
            { nisn: { contains: query } },
        ];
    }
    if (waveId) {
        baseWhere.waveId = waveId;
    }

    // Where clause dengan filter status (untuk data paginasi)
    const whereClause: any = { ...baseWhere };
    if (status) {
        whereClause.statusVerifikasi = status;
    }

    const [students, totalFiltered, pendingCount, verifiedCount, rejectedCount, waves] = await Promise.all([
        db.student.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                documents: true,
                user: { select: { email: true } }
            },
            skip,
            take: PAGE_SIZE,
        }),
        db.student.count({ where: whereClause }),
        db.student.count({ where: { ...baseWhere, statusVerifikasi: "PENDING" } }),
        db.student.count({ where: { ...baseWhere, statusVerifikasi: "VERIFIED" } }),
        db.student.count({ where: { ...baseWhere, statusVerifikasi: "REJECTED" } }),
        db.wave.findMany({ orderBy: { startDate: 'desc' } }),
    ]);

    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

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
            <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col lg:flex-row gap-6 justify-between items-center lg:items-end">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <VerificationStatusFilter
                        pendingCount={pendingCount}
                        verifiedCount={verifiedCount}
                        rejectedCount={rejectedCount}
                        initialStatus={status}
                    />

                    <div className="h-12 w-px bg-slate-100 dark:bg-slate-700 hidden lg:block mx-2" />

                    <div className="flex-1 lg:flex-none">
                        <WaveSelector waves={waves} initialWaveId={waveId} />
                    </div>
                </div>

                <div className="w-full lg:w-auto lg:min-w-[320px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 block mb-1.5">Cari Pendaftar</span>
                    <Suspense fallback={<div className="w-full h-10 bg-slate-100 rounded-lg animate-pulse" />}>
                        <SearchInput />
                    </Suspense>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {students.map((student: any) => (
                    <div key={student.id} className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 flex flex-col gap-4 hover:border-primary/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                    {student.documents?.pasFoto ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={getFileUrl(student.documents?.pasFoto)}
                                            alt="Pas Foto"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-400">person</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{student.namaLengkap}</h3>
                                    <p className="text-xs text-slate-500">NISN: {student.nisn}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[150px]" title={student.user?.email || '-'}>📧 {student.user?.email || '-'}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[150px]" title={student.telepon || '-'}>📱 {student.telepon || '-'}</p>
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
                                    {formatInWIB(student.createdAt, {
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white dark:bg-[#1e293b] p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <Suspense fallback={null}>
                        <PaginationControl
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalFiltered}
                            itemsPerPage={PAGE_SIZE}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    );
}
