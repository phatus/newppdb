import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PrintButton from "@/components/admin/PrintButton";
import Link from "next/link";

export default async function AdminExamCardPage({ params }: any) {
    const { id } = await params;

    const student = await db.student.findUnique({
        where: { id },
        include: {
            documents: true,
        },
    });

    if (!student) return notFound();

    // Fetch school settings
    const settings = await db.schoolSettings.findFirst();
    const schoolName = settings?.schoolName || "MTsN 1 Pacitan";
    const academicYear = settings?.academicYear || "2025/2026";
    const schoolLogo = settings?.schoolLogo;

    // Fetch Exam Schedules
    let examSchedules: any[] = [];
    try {
        examSchedules = await (db as any).examSchedule.findMany({
            orderBy: { order: "asc" },
        });
    } catch {
        // ExamSchedule model may not exist yet
    }

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8 print:p-0 print:bg-white">
            <div className="max-w-[1100px] mx-auto space-y-6 w-full print:max-w-none print:w-full">
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
                            Kartu Peserta Ujian
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {student.namaLengkap} — NISN: {student.nisn}
                        </p>
                    </div>
                    <PrintButton />
                </div>

                {student.statusVerifikasi !== "VERIFIED" && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center print:hidden">
                        <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                        <h2 className="text-xl font-bold mb-2">Siswa Belum Terverifikasi</h2>
                        <p>Kartu ujian hanya tersedia untuk siswa yang sudah terverifikasi.</p>
                    </div>
                )}

                {student.statusVerifikasi === "VERIFIED" && (
                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl overflow-x-auto print:bg-white print:border-none print:p-0 print:overflow-visible">
                        <div id="printable-area">
                            <div className="bg-white text-slate-900 w-full min-w-[620px] max-w-[700px] border-2 border-slate-800 p-8 mx-auto shadow-md relative print:shadow-none print:mx-0 print:w-full print:max-w-none print:border-2">
                                {/* Header */}
                                <div className="flex items-center justify-between border-b-[3px] border-double border-slate-800 pb-4 mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 flex items-center justify-center overflow-hidden">
                                            {schoolLogo ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                                            ) : (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src="/uploads/school_logo_1767362065250.png" alt="Logo" className="w-full h-full object-contain" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg leading-none">Panitia PMBM</h3>
                                            <h2 className="font-black text-2xl leading-tight">{schoolName}</h2>
                                            <p className="text-sm font-medium tracking-wider">Tahun Pelajaran {academicYear}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 inline-block mb-1 print:bg-black print:text-white">
                                            Kartu Peserta
                                        </div>
                                        <p className="text-[10px] font-mono">No. Dok: 001/PMBM/{new Date().getFullYear()}</p>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-center font-bold text-xl underline underline-offset-4 mb-6">KARTU PESERTA UJIAN</h2>

                                {/* Content */}
                                <div className="flex gap-8">
                                    <div className="flex-1 space-y-2.5 text-sm">
                                        <div className="flex">
                                            <span className="w-32 font-semibold">Nomor Ujian</span>
                                            <span className="font-bold font-mono text-lg tracking-wide">: {student.nomorUjian || "Belum Terbit"}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 font-semibold">Password CBT</span>
                                            <span className="font-bold font-mono text-lg tracking-wide text-slate-900 border px-2 border-slate-900 bg-slate-200 print:bg-transparent">: {student.passwordCbt || "Belum ada"}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 font-semibold">Nama Lengkap</span>
                                            <span className="font-bold">: {student.namaLengkap}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 font-semibold">NISN</span>
                                            <span className="font-mono">: {student.nisn}</span>
                                        </div>
                                        <div className="flex">
                                            <span className="w-32 font-semibold">Asal Sekolah</span>
                                            <span>: {student.asalSekolah || "-"}</span>
                                        </div>
                                    </div>
                                    <div className="w-32 h-40 border border-slate-400 bg-slate-50 flex flex-col items-center justify-center shrink-0 print:border-slate-800 overflow-hidden relative">
                                        {student.documents?.pasFoto ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={student.documents.pasFoto}
                                                alt="Pas Foto"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-4xl text-slate-300 print:hidden">person</span>
                                                <span className="text-[10px] text-slate-400 mt-2 text-center px-2 print:text-slate-800">Pas Foto 3x4</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div className="mt-8">
                                    <h4 className="font-bold text-sm mb-2 border-l-4 border-slate-800 pl-2">Jadwal Ujian</h4>
                                    <table className="w-full text-sm border-collapse border border-slate-800">
                                        <thead>
                                            <tr className="bg-slate-100 print:bg-slate-200 text-left">
                                                <th className="border border-slate-800 p-2 text-center w-8 font-bold">No</th>
                                                <th className="border border-slate-800 p-2 text-center w-32 font-bold">Hari/Tanggal</th>
                                                <th className="border border-slate-800 p-2 text-center w-32 font-bold">Waktu</th>
                                                <th className="border border-slate-800 p-2 font-bold">Mata Pelajaran</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {examSchedules.length > 0 ? (
                                                examSchedules.map((schedule: any, idx: number) => (
                                                    <tr key={schedule.id}>
                                                        <td className="border border-slate-800 p-2 text-center">{idx + 1}</td>
                                                        <td className="border border-slate-800 p-2 text-center font-medium">{schedule.dayDate}</td>
                                                        <td className="border border-slate-800 p-2 text-center">{schedule.time}</td>
                                                        <td className="border border-slate-800 p-2">{schedule.subject}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="border border-slate-800 p-4 text-center text-slate-500 italic">
                                                        Jadwal belum tersedia.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-8 flex justify-between items-end pt-4 border-t border-slate-300 print:border-slate-800">
                                    <div className="text-[10px] text-slate-600 max-w-xs italic leading-tight print:text-black">
                                        * Kartu ini adalah bukti sah mengikuti ujian seleksi.<br />
                                        * Harap dibawa saat pelaksanaan ujian beserta alat tulis.
                                    </div>
                                    <div className="text-[10px] font-mono opacity-50 print:opacity-100">
                                        Printed: {new Date().toLocaleDateString('id-ID')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
