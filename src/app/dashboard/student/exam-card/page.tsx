import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentSelector from "@/components/StudentSelector";
import PrintButton from "@/components/PrintButton";

interface Student {
    id: string;
    namaLengkap: string;
    nisn: string;
    asalSekolah: string | null;
    tempatLahir: string | null;
    tanggalLahir: Date | null;
    alamatLengkap: string | null;
    statusVerifikasi: string;
    nomorUjian: string | null;
    documents: any;
    gender: string | null;
    createdAt: Date;
    [key: string]: any;
}

export default async function ExamCardPage({
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
    const isVerified = selectedStudent.statusVerifikasi === "VERIFIED";

    // Use assigned nomorUjian from DB
    const nomorUjian = selectedStudent.nomorUjian || "Belum Terbit";

    // Fetch school settings
    const settings = await db.schoolSettings.findFirst();
    const schoolName = settings?.schoolName || "MTsN 1 Pacitan";
    const academicYear = settings?.academicYear || "2025/2026";
    const schoolLogo = settings?.schoolLogo;
    const committeeName = settings?.committeeName || "Ketua Panitia";

    // Fetch Exam Schedule
    const examSchedules = await db.examSchedule.findMany({
        orderBy: { order: 'asc' }
    });

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8 print:p-0 print:bg-white">
            <div className="max-w-[1100px] mx-auto space-y-6 w-full print:max-w-none print:w-full">
                {/* Back Link (Hidden in Print) */}
                <div className="mb-6 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 print:hidden">
                    <a
                        href="/dashboard"
                        className="hover:text-primary flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Kembali ke Dashboard
                    </a>
                </div>

                {/* Status Sidebar (Hidden in Print) */}
                {!isVerified && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-xl text-center print:hidden">
                        <span className="material-symbols-outlined text-4xl mb-2">lock</span>
                        <h2 className="text-xl font-bold mb-2">Kartu Ujian Belum Tersedia</h2>
                        <p>
                            Maaf, kartu ujian Anda belum dapat dicetak karena data Anda belum diverifikasi oleh panitia.
                            <br />
                            Silakan cek kembali status pendaftaran Anda secara berkala.
                        </p>
                    </div>
                )}

                {isVerified && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                        {/* Sidebar (Hidden in Print) */}
                        <div className="lg:col-span-4 flex flex-col gap-6 print:hidden">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                                <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-4">
                                    Status Pendaftaran
                                </h3>
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-4 flex gap-3 mb-6">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-2xl">verified</span>
                                    <div>
                                        <p className="font-bold text-green-700 dark:text-green-400 text-sm">Terverifikasi</p>
                                        <p className="text-xs text-green-600 dark:text-green-500 mt-1 leading-relaxed">
                                            Silakan cetak kartu ujian dan bawa saat pelaksanaan tes.
                                        </p>
                                    </div>
                                </div>
                                <StudentSelector
                                    students={students.map((s) => ({
                                        id: s.id,
                                        namaLengkap: s.namaLengkap,
                                        nisn: s.nisn,
                                    }))}
                                    currentStudentId={selectedStudent.id}
                                />
                            </div>
                        </div>

                        {/* Main Content: Exam Card */}
                        <div className="lg:col-span-8 flex flex-col w-full">
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                                <div className="p-6 md:p-8 print:p-0">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
                                        <div>
                                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                                Kartu Peserta Ujian
                                            </h1>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                Gunakan kertas A4 untuk mencetak kartu ini.
                                            </p>
                                        </div>
                                        <PrintButton />
                                    </div>

                                    {/* The Card Container */}
                                    <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl overflow-x-auto print:bg-white print:border-none print:p-0 print:overflow-visible">
                                        {/* The Card Itself */}
                                        <div className="bg-white text-slate-900 w-full min-w-[620px] max-w-[700px] border-2 border-slate-800 p-8 mx-auto shadow-md relative print:shadow-none print:mx-0 print:w-full print:max-w-none print:border-2">
                                            {/* Header */}
                                            <div className="flex items-center justify-between border-b-[3px] border-double border-slate-800 pb-4 mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-16 flex items-center justify-center overflow-hidden">
                                                        {schoolLogo ? (
                                                            <img src={schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                                                        ) : (
                                                            <img src="/uploads/school_logo_1767362065250.png" alt="Logo" className="w-full h-full object-contain" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-lg leading-none">Panitia PPDB</h3>
                                                        <h2 className="font-black text-2xl leading-tight">{schoolName}</h2>
                                                        <p className="text-sm font-medium tracking-wider">Tahun Pelajaran {academicYear}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 inline-block mb-1 print:bg-black print:text-white">
                                                        Kartu Peserta
                                                    </div>
                                                    <p className="text-[10px] font-mono">No. Dok: 001/PPDB/{new Date().getFullYear()}</p>
                                                </div>
                                            </div>

                                            {/* Title */}
                                            <h2 className="text-center font-bold text-xl underline underline-offset-4 mb-6">KARTU PESERTA UJIAN</h2>

                                            {/* Content */}
                                            <div className="flex gap-8">
                                                <div className="flex-1 space-y-2.5 text-sm">
                                                    <div className="flex">
                                                        <span className="w-32 font-semibold">Nomor Ujian</span>
                                                        <span className="font-bold font-mono text-lg tracking-wide">: {nomorUjian}</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="w-32 font-semibold">Password CBT</span>
                                                        <span className="font-bold font-mono text-lg tracking-wide text-slate-900 border px-2 border-slate-900 bg-slate-200 print:bg-transparent">: {selectedStudent.passwordCbt || "Belum ada"}</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="w-32 font-semibold">Nama Lengkap</span>
                                                        <span className="font-bold">: {selectedStudent.namaLengkap}</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="w-32 font-semibold">NISN</span>
                                                        <span className="font-mono">: {selectedStudent.nisn}</span>
                                                    </div>
                                                    <div className="flex">
                                                        <span className="w-32 font-semibold">Asal Sekolah</span>
                                                        <span>: {selectedStudent.asalSekolah || "-"}</span>
                                                    </div>
                                                    {/* Lokasi Ujian REMOVED as requested */}
                                                </div>
                                                <div className="w-32 h-40 border border-slate-400 bg-slate-50 flex flex-col items-center justify-center shrink-0 print:border-slate-800 overflow-hidden relative">
                                                    {selectedStudent.documents?.pasFoto ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img
                                                            src={selectedStudent.documents.pasFoto}
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
                                                            examSchedules.map((schedule, idx) => (
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
                                            </div>
                                        </div>
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
