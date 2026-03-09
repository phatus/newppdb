import { db } from "@/lib/db";
import Link from "next/link";
import SearchInput from "@/components/admin/SearchInput";
import WaveSelector from "@/components/admin/WaveSelector";
import VerificationStatusFilter from "@/components/admin/VerificationStatusFilter";
import PaginationControl from "@/components/admin/PaginationControl";
import VerificationClaimFilter from "@/components/admin/VerificationClaimFilter";
import { Suspense } from "react";
import { formatInWIB } from "@/lib/date-utils";
import { getFileUrl } from "@/lib/utils";
import { checkStudentCompleteness } from "@/lib/completeness-utils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const PAGE_SIZE = 12;

export default async function VerificationListPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; waveId?: string; status?: string; page?: string; claim?: string }>;
}) {
    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || "";
    const waveId = resolvedParams?.waveId;
    const status = resolvedParams?.status;
    const claimFilter = resolvedParams?.claim; // "mine" to filter by current user
    const currentPage = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
    const skip = (currentPage - 1) * PAGE_SIZE;

    // Get current admin user
    const session = await getServerSession(authOptions);
    const currentUser = session?.user?.email
        ? await db.user.findUnique({ where: { email: session.user.email }, select: { id: true, name: true } })
        : null;

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
    if (claimFilter === "mine" && currentUser) {
        whereClause.verifierId = currentUser.id;
    } else if (claimFilter === "unclaimed") {
        whereClause.verifierId = null;
    }

    // Fetch student status counts using groupBy to save connections
    const [students, totalFiltered, countsByStatus, waves, semestersCount] = await Promise.all([
        db.student.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                documents: true,
                user: { select: { email: true } },
                grades: { include: { semesterGrades: true } }
            },
            skip,
            take: PAGE_SIZE,
        }),
        db.student.count({ where: whereClause }),
        db.student.groupBy({
            by: ['statusVerifikasi'],
            where: baseWhere,
            _count: { _all: true }
        }),
        db.wave.findMany({ orderBy: { startDate: 'desc' } }),
        db.semester.count({
            where: { isActive: true }
        }),
    ]);

    // Map counts from grouped result
    const pendingCount = countsByStatus.find(c => c.statusVerifikasi === "PENDING")?._count._all || 0;
    const verifiedCount = countsByStatus.find(c => c.statusVerifikasi === "VERIFIED")?._count._all || 0;
    const rejectedCount = countsByStatus.find(c => c.statusVerifikasi === "REJECTED")?._count._all || 0;

    const requiredSemesterCount = semestersCount || 5;

    // Fetch verifier names for claimed students
    const verifierIds = [...new Set(students.map((s: any) => s.verifierId).filter(Boolean))];
    const verifiers = verifierIds.length > 0
        ? await db.user.findMany({
            where: { id: { in: verifierIds } },
            select: { id: true, name: true, email: true }
        })
        : [];
    const verifierMap: Record<string, string> = {};
    verifiers.forEach(v => { verifierMap[v.id] = v.name || v.email; });

    const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);

    return (
        <div className="p-6 w-full max-w-[1240px] mx-auto flex flex-col gap-6">
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

                    <div className="h-12 w-px bg-slate-100 dark:bg-slate-700 hidden lg:block mx-2" />

                    <div className="flex-1 lg:flex-none">
                        <VerificationClaimFilter initialClaim={claimFilter} />
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
                {students.map((student: any) => {
                    const completeness = checkStudentCompleteness(student, requiredSemesterCount);
                    return (
                        <div key={student.id} className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-primary/50 transition-colors flex flex-col">
                            {/* Card Header & Status */}
                            <div className="flex justify-between items-start p-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/20">
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${student.statusVerifikasi === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                        student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                        }`}>
                                        {student.statusVerifikasi || 'PENDING'}
                                    </span>

                                    {/* Data Completeness Badge */}
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 group relative cursor-help ${completeness.isComplete
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                                        : 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${completeness.isComplete ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                        {completeness.isComplete ? 'Data Lengkap' : 'Belum Lengkap'}

                                        {!completeness.isComplete && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-3 bg-slate-900 dark:bg-slate-800 text-white text-[11px] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all w-64 z-20 pointer-events-none border border-slate-700">
                                                <div className="font-bold mb-2 flex flex-col border-b border-slate-700 pb-2">
                                                    <span className="text-rose-400">Data Kurang ({completeness.missing.length}):</span>
                                                </div>
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {completeness.missing.slice(0, 5).map((item, idx) => (
                                                        <li key={idx} className="text-slate-200">{item}</li>
                                                    ))}
                                                    {completeness.missing.length > 5 && (
                                                        <li className="text-slate-400 italic pt-1 text-[10px]">+{completeness.missing.length - 5} baris lainnya</li>
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </span>
                                </div>

                                {/* Verifier Info (Top Right) */}
                                {student.verifierId && (
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400" title={`Verifikator: ${verifierMap[student.verifierId] || 'Admin'}`}>
                                        <span className="material-symbols-outlined text-[14px]">
                                            {student.verifierId === currentUser?.id ? 'assignment_ind' : 'person'}
                                        </span>
                                        <span className={`max-w-[80px] truncate ${student.verifierId === currentUser?.id ? 'text-primary font-bold' : ''}`}>
                                            {student.verifierId === currentUser?.id ? 'Milik Anda' : verifierMap[student.verifierId] || 'Admin'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Main Content */}
                            <div className="p-4 flex flex-col flex-1 gap-4">
                                <div className="flex gap-4">
                                    <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                        {student.documents?.pasFoto ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={getFileUrl(student.documents?.pasFoto)}
                                                alt="Pas Foto"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate" title={student.namaLengkap}>
                                            {student.namaLengkap}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600 dark:text-slate-400">
                                            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{student.nisn}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-[#151e2b] rounded-lg border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400" title={student.user?.email || '-'}>
                                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">mail</span>
                                        <span className="truncate">{student.user?.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400" title={student.telepon || '-'}>
                                        <span className="material-symbols-outlined text-[14px] text-slate-400 shrink-0">phone_iphone</span>
                                        <span className="truncate">{student.telepon || '-'}</span>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400 px-1 mt-auto">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">route</span>
                                        <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">
                                            {student.jalur?.replace('_', ' ').toLowerCase() || '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                        <span>
                                            {formatInWIB(student.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="p-4 pt-0 mt-auto">
                                <Link href={`/admin/verification/${student.id}`}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 py-2.5 rounded-lg font-bold text-sm transition-all group"
                                >
                                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">edit_document</span>
                                    Periksa Berkas
                                </Link>
                            </div>
                        </div>
                    )
                })}

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
