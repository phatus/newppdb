import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import Link from "next/link";

export default async function AdminRegistrationProofPage({ params }: any) {
    const { id } = await params;

    const student = await db.student.findUnique({
        where: { id },
        include: {
            documents: true,
        },
    });

    if (!student) return notFound();

    // Use Raw Query to fetch settings to avoid stale Prisma Client issues
    const settingsRaw: any[] = await db.$queryRaw`SELECT * FROM "SchoolSettings" LIMIT 1`;
    const settings = settingsRaw[0] || {};
    const schoolName = settings?.schoolName || "MTsN 1 Pacitan";
    const academicYear = settings?.academicYear || "2025/2026";
    const schoolLogo = settings?.schoolLogo;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8 print:p-0 print:bg-white">
            <div className="max-w-[800px] mx-auto space-y-6 w-full print:max-w-none print:w-full">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                    <div>
                        <Link
                            href={`/admin/verification/${id}`}
                            className="text-slate-500 hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors mb-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Kembali ke Detail Verifikasi
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Bukti Pendaftaran
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {student.namaLengkap} — NISN: {student.nisn}
                        </p>
                    </div>
                    <PrintButton />
                </div>

                {/* The Document */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="p-6 md:p-8 print:p-0">
                        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl overflow-x-auto print:bg-white print:border-none print:p-0 print:overflow-visible">
                            <div id="printable-area" className="bg-white text-slate-900 w-full md:w-[210mm] min-h-[297mm] border border-slate-300 p-8 mx-auto shadow-md relative print:shadow-none print:mx-0 print:w-full print:max-w-none print:border-none font-sans print:min-h-0 print:h-auto print:p-6 print:text-sm">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6 print:pb-2 print:mb-4">
                                    <div className="flex items-center gap-4 print:gap-3">
                                        <div className="size-20 flex items-center justify-center overflow-hidden shrink-0 print:size-16">
                                            {schoolLogo ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src="/uploads/school_logo_1767362065250.png" alt="Logo" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div className="space-y-1 print:space-y-0">
                                            <h3 className="font-bold text-lg text-slate-700 leading-none print:text-base">Panitia PMBM</h3>
                                            <h2 className="font-black text-3xl leading-none text-slate-900 print:text-2xl">{schoolName}</h2>
                                            <p className="text-sm font-medium text-slate-600 tracking-wide print:text-xs">Tahun Pelajaran {academicYear}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 mb-2 print:bg-black print:text-white print:px-3 print:py-1 print:mb-1 print:text-[10px]">
                                            Bukti Pendaftaran
                                        </div>
                                        <div className="text-right font-medium text-sm text-slate-600 print:text-xs">
                                            No. Reg : <span className="font-mono font-bold text-slate-900">{student.id.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-center font-bold text-2xl mb-8 text-slate-900 print:text-xl print:mb-4">TANDA TERIMA PENDAFTARAN</h2>

                                {/* Content */}
                                <div className="space-y-8 print:space-y-4">
                                    <p className="text-base leading-relaxed text-slate-700 print:text-sm">
                                        Telah terima berkas pendaftaran Murid Baru Tahun Pelajaran {academicYear} dengan data sebagai berikut:
                                    </p>

                                    <div className="space-y-4 print:space-y-2">
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Nama Lengkap</span>
                                            <span>:</span>
                                            <span className="font-bold text-slate-900">{student.namaLengkap}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">NISN</span>
                                            <span>:</span>
                                            <span className="font-mono text-slate-900">{student.nisn}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Asal Sekolah</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{student.asalSekolah || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Tempat/Tgl Lahir</span>
                                            <span>:</span>
                                            <span className="text-slate-900">
                                                {student.tempatLahir}, {student.tanggalLahir ? new Date(student.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Jenis Kelamin</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{student.gender || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Alamat</span>
                                            <span>:</span>
                                            <span className="text-slate-900 block w-full">{student.alamatLengkap || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Jalur Pendaftaran</span>
                                            <span>:</span>
                                            <span className="text-slate-900 font-bold">
                                                {student.jalur === "REGULER" ? "Reguler / Zonasi" :
                                                    student.jalur === "PRESTASI_AKADEMIK" ? "Prestasi Akademik" :
                                                        student.jalur === "PRESTASI_NON_AKADEMIK" ? "Prestasi Non-Akademik" :
                                                            student.jalur || "-"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Waktu Pendaftaran</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{new Date(student.createdAt).toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl print:bg-slate-50 print:border-slate-300 print:p-4">
                                        <h4 className="font-bold text-sm text-slate-900 mb-4 print:mb-2 text-xs">Kelengkapan Dokumen:</h4>
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-8 print:gap-y-2 print:gap-x-4">
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${student.documents?.fileAkta ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {student.documents?.fileAkta && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Akta Kelahiran</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${student.documents?.fileKK ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {student.documents?.fileKK && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Kartu Keluarga</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${student.documents?.fileSKL ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {student.documents?.fileSKL && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Surat Keterangan Lulus</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${student.documents?.fileRaport ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {student.documents?.fileRaport && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Raport</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${student.documents?.pasFoto ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {student.documents?.pasFoto && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Pas Foto</span>
                                            </div>
                                            {(student.jalur === "PRESTASI_AKADEMIK" || student.jalur === "PRESTASI_NON_AKADEMIK" || (student.documents?.filePrestasi && (student.documents?.filePrestasi as any[]).length > 0)) && (
                                                <div className="flex items-center gap-3 print:gap-2">
                                                    <div className={`flex items-center justify-center size-5 rounded border ${(student.documents?.filePrestasi && (student.documents?.filePrestasi as any[]).length > 0) ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                        {(student.documents?.filePrestasi && (student.documents?.filePrestasi as any[]).length > 0) && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700">Dokumen Prestasi</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50/50 p-4 pl-5 text-xs text-slate-600 italic border-l-[3px] border-slate-300 print:bg-white print:border-slate-800 print:p-2 print:pl-4 print:text-[10px]">
                                        <p className="font-bold mb-1 text-slate-700 not-italic">Catatan:</p>
                                        <ul className="list-disc ml-4 space-y-1">
                                            <li>Bukti pendaftaran ini harap dibawa saat verifikasi berkas fisik.</li>
                                            <li>Pantau terus status pendaftaran Anda melalui halaman dashboard.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-12 pt-4 border-t-2 border-slate-100 print:mt-8 print:pt-2">
                                    <div className="flex flex-col gap-1 text-left">
                                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Dokumen Sah
                                        </p>
                                        <p className="text-[10px] text-slate-600 leading-relaxed max-w-lg italic">
                                            Dokumen ini adalah bukti cetakan komputer dan sah tanpa tanda tangan basah.
                                            Keaslian dokumen dapat divalidasi oleh panitia menggunakan Nomor Registrasi yang tertera di pojok kanan atas.
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            Dicetak pada: {new Date().toLocaleString("id-ID", {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
