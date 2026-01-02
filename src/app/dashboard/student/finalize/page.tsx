import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentSelector from "@/components/StudentSelector";
import FinalizeButton from "@/components/FinalizeButton";
import Link from "next/link";

interface Student {
    id: string;
    namaLengkap: string;
    nisn: string;
    asalSekolah: string | null;
    tempatLahir: string | null;
    tanggalLahir: Date | null;
    alamatLengkap: string | null;
    statusVerifikasi: string;
    documents: any;
    gender: string | null;
    createdAt: Date;
    [key: string]: any;
}

export default async function FinalizePage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
        redirect("/auth/login");
    }

    const students = await db.student.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            updatedAt: "desc",
        },
        include: {
            documents: true,
        },
    }) as unknown as Student[];

    if (students.length === 0) {
        redirect("/dashboard/student/add");
    }

    // Determine selected student
    const resolvedParams = await searchParams;
    const studentIdParam = resolvedParams?.studentId;
    const selectedStudentId = Array.isArray(studentIdParam)
        ? studentIdParam[0]
        : studentIdParam || students[0].id;

    const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
    const docs = selectedStudent.documents || {};

    // Check if documents are complete
    const isComplete = !!(docs.fileAkta && docs.fileKK && docs.fileSKL && docs.fileRaport && docs.pasFoto);
    const isFinalized = selectedStudent.statusVerifikasi !== "DRAFT" && selectedStudent.statusVerifikasi !== "REJECTED" && selectedStudent.statusVerifikasi !== undefined; // Adjust logic based on default status
    // Actually default is PENDING usually? Let's check schema. Schema default is PENDING.
    // So if it is PENDING, it might be auto-finalized or we need a specific flag?
    // Assuming "PENDING" means finalized and waiting. "DRAFT" isn't in schema enum.
    // If schema default is PENDING, then all new students are PENDING.
    // Maybe we should treat "PENDING" as "Submitted".
    // Or maybe we need a new status?
    // For now, let's assume if it is PENDING, it is submitted.
    // But wait, if they just registered, it is PENDING.
    // Maybe we don't need a wrapper "Finalize" button if it's already PENDING?
    // User request implies there IS a finalize step.
    // Let's assume the button re-confirms or we treat it as "Ready for Review".
    // Actually, if status is PENDING, show "Menunggu Verifikasi".

    const statusLabel = {
        PENDING: { text: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-700 border-amber-200", icon: "hourglass_empty" },
        VERIFIED: { text: "Terverifikasi", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: "verified" },
        REJECTED: { text: "Ditolak / Perlu Revisi", color: "bg-red-100 text-red-700 border-red-200", icon: "cancel" },
    }[selectedStudent.statusVerifikasi as string] || { text: "Status Tidak Diketahui", color: "bg-slate-100 text-slate-700", icon: "help" };

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-5xl mx-auto space-y-6 w-full">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <a
                                href="/dashboard"
                                className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                            >
                                <span className="material-symbols-outlined text-[20px] mr-2">
                                    home
                                </span>
                                Beranda
                            </a>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-slate-400 mx-1">
                                    chevron_right
                                </span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Pendaftaran
                                </span>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="material-symbols-outlined text-slate-400 mx-1">
                                    chevron_right
                                </span>
                                <span className="text-sm font-medium text-primary dark:text-primary">
                                    Finalisasi & Cetak
                                </span>
                            </div>
                        </li>
                    </ol>
                </nav>

                {/* Status Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                            Finalisasi Data
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">
                            Periksa kembali data diri dan dokumen sebelum melakukan finalisasi.
                        </p>
                    </div>
                </div>

                {/* Student Selector */}
                <StudentSelector
                    students={students.map((s) => ({
                        id: s.id,
                        namaLengkap: s.namaLengkap,
                        nisn: s.nisn,
                    }))}
                    currentStudentId={selectedStudent.id}
                />

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Data Review */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Status Alert */}
                        <div className={`p-4 rounded-lg border flex items-start gap-3 ${statusLabel.color.replace('text-', 'border-').replace('bg-', 'bg-opacity-20 ')} bg-opacity-20`}>
                            <span className="material-symbols-outlined text-2xl">{statusLabel.icon}</span>
                            <div>
                                <h3 className="font-bold text-lg">Status Pendaftaran: {statusLabel.text}</h3>
                                <p className="text-sm opacity-90 mt-1">
                                    {selectedStudent.statusVerifikasi === 'VERIFIED'
                                        ? "Selamat! Data Anda telah diverifikasi. Silakan cetak kartu ujian."
                                        : "Data Anda sedang dalam proses verifikasi oleh panitia."}
                                </p>
                            </div>
                        </div>

                        {/* Data Diri Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Data Diri Siswa
                                </h3>
                                <Link href={`/dashboard/student/add?studentId=${selectedStudent.id}`} className="text-primary text-sm font-semibold hover:underline">
                                    Edit Data
                                </Link>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Nama Lengkap</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.namaLengkap}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">NISN</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.nisn}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Tempat, Tanggal Lahir</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            {selectedStudent.tempatLahir}, {selectedStudent.tanggalLahir ? new Date(selectedStudent.tanggalLahir).toLocaleDateString("id-ID") : "-"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Jenis Kelamin</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.gender || "-"}</dd>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Alamat</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.alamatLengkap || "-"}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Data Sekolah Check */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">school</span>
                                    Data Sekolah Asal
                                </h3>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                                    <div>
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Asal Sekolah</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{selectedStudent.asalSekolah || "-"}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Documents & Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Final Action Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border-2 border-primary/20 p-6 flex flex-col gap-6 sticky top-24">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Konfirmasi Akhir</h3>

                            <div className="space-y-3">
                                {/* Document Status List */}
                                <div className="flex items-center justify-center p-2 rounded bg-slate-50 dark:bg-slate-700/50 gap-3 border border-slate-200 dark:border-slate-600 mb-2">
                                    <div className="w-16 h-20 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-500">
                                        {docs.pasFoto ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={docs.pasFoto} alt="Pas Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-slate-400">person</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Pas Foto</p>
                                        <p className="text-xs text-slate-500">{docs.pasFoto ? "Sudah Diunggah" : "Belum Ada"}</p>
                                    </div>
                                    {docs.pasFoto ? <span className="text-green-600 material-symbols-outlined">check_circle</span> : <span className="text-red-500 material-symbols-outlined">cancel</span>}
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                    <span className="text-sm font-medium">Akta Kelahiran</span>
                                    {docs.fileAkta ? <span className="text-green-600 material-symbols-outlined text-sm">check_circle</span> : <span className="text-red-500 material-symbols-outlined text-sm">cancel</span>}
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                    <span className="text-sm font-medium">Kartu Keluarga</span>
                                    {docs.fileKK ? <span className="text-green-600 material-symbols-outlined text-sm">check_circle</span> : <span className="text-red-500 material-symbols-outlined text-sm">cancel</span>}
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                    <span className="text-sm font-medium">SKL</span>
                                    {docs.fileSKL ? <span className="text-green-600 material-symbols-outlined text-sm">check_circle</span> : <span className="text-red-500 material-symbols-outlined text-sm">cancel</span>}
                                </div>
                                <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                    <span className="text-sm font-medium">Raport</span>
                                    {docs.fileRaport ? <span className="text-green-600 material-symbols-outlined text-sm">check_circle</span> : <span className="text-red-500 material-symbols-outlined text-sm">cancel</span>}
                                </div>
                                {(selectedStudent.jalur === "PRESTASI_AKADEMIK" || selectedStudent.jalur === "PRESTASI_NON_AKADEMIK" || (docs.filePrestasi && docs.filePrestasi.length > 0)) && (
                                    <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-700/50">
                                        <span className="text-sm font-medium">Dokumen Prestasi</span>
                                        {(docs.filePrestasi && docs.filePrestasi.length > 0) ?
                                            <span className="text-green-600 material-symbols-outlined text-sm">check_circle</span> :
                                            <span className="text-amber-500 material-symbols-outlined text-sm" title="Opsional / Belum Diunggah">help</span>
                                        }
                                    </div>
                                )}
                            </div>

                            {!isComplete ? (
                                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 flex gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    <p>Mohon lengkapi semua dokumen di menu Unggah Dokumen sebelum finalisasi.</p>
                                </div>
                            ) : null}

                            {selectedStudent.statusVerifikasi === "VERIFIED" ? (
                                <Link
                                    href="/dashboard/student/exam-card"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 text-decoration-none"
                                >
                                    <span className="material-symbols-outlined">print</span>
                                    Cetak Kartu Ujian
                                </Link>
                            ) : (
                                <FinalizeButton
                                    studentId={selectedStudent.id}
                                    isComplete={isComplete}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
