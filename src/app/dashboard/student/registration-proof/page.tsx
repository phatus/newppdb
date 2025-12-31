import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
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

export default async function RegistrationProofPage({
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

    const selectedStudent = students.find((s) => s.id === selectedStudentId);

    if (!selectedStudent) {
        return <div>Student not found</div>;
    }

    // Determine default status if PENDING and not rejected or verified
    const isSubmitted = selectedStudent.statusVerifikasi !== "DRAFT";
    // Usually if they can access this, they should have at least submitted? 
    // Actually the button is on the card, so they exist.

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8 print:p-0 print:bg-white">
            <div className="max-w-[800px] mx-auto space-y-6 w-full print:max-w-none print:w-full">
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

                {/* Main Content: Registration Proof */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="p-6 md:p-8 print:p-0">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 print:hidden">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Bukti Pendaftaran
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Simpan dokumen ini sebagai bukti pendaftaran yang sah.
                                </p>
                            </div>
                            <PrintButton />
                        </div>

                        {/* The Document Container */}
                        <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl overflow-x-auto print:bg-white print:border-none print:p-0 print:overflow-visible">
                            {/* The Document Itself */}
                            <div className="bg-white text-slate-900 w-full md:w-[210mm] min-h-[297mm] border border-slate-300 p-8 mx-auto shadow-md relative print:shadow-none print:mx-0 print:w-full print:max-w-none print:border-none font-sans print:min-h-0 print:h-auto print:p-6 print:text-sm">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4 mb-6 print:pb-2 print:mb-4">
                                    <div className="flex items-center gap-4 print:gap-3">
                                        <div className="size-20 flex items-center justify-center border-[2.5px] border-slate-800 rounded-full shrink-0 print:size-16 print:border-2">
                                            <span className="material-symbols-outlined text-5xl text-slate-800 print:text-4xl">school</span>
                                        </div>
                                        <div className="space-y-1 print:space-y-0">
                                            <h3 className="font-bold text-lg uppercase text-slate-700 leading-none tracking-wide print:text-base">Panitia PPDB</h3>
                                            <h2 className="font-black text-3xl uppercase leading-none tracking-tight text-slate-900 print:text-2xl">SMP Merdeka</h2>
                                            <p className="text-sm font-medium text-slate-600 tracking-wide print:text-xs">Tahun Pelajaran 2025/2026</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="bg-slate-900 text-white text-xs font-bold px-4 py-1.5 mb-2 tracking-widest uppercase print:bg-black print:text-white print:px-3 print:py-1 print:mb-1 print:text-[10px]">
                                            Bukti Pendaftaran
                                        </div>
                                        <div className="text-right font-medium text-sm text-slate-600 print:text-xs">
                                            No. Reg : <span className="font-mono font-bold text-slate-900">{selectedStudent.id.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Title */}
                                <h2 className="text-center font-bold text-2xl mb-8 uppercase tracking-wide text-slate-900 print:text-xl print:mb-4">TANDA TERIMA PENDAFTARAN</h2>

                                {/* Content */}
                                <div className="space-y-8 print:space-y-4">
                                    <p className="text-base leading-relaxed text-slate-700 print:text-sm">
                                        Telah terima berkas pendaftaran Peserta Didik Baru Tahun Pelajaran 2025/2026 dengan data sebagai berikut:
                                    </p>

                                    <div className="space-y-4 print:space-y-2">
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Nama Lengkap</span>
                                            <span>:</span>
                                            <span className="font-bold uppercase text-slate-900">{selectedStudent.namaLengkap}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">NISN</span>
                                            <span>:</span>
                                            <span className="font-mono text-slate-900">{selectedStudent.nisn}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Asal Sekolah</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{selectedStudent.asalSekolah || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Tempat/Tgl Lahir</span>
                                            <span>:</span>
                                            <span className="text-slate-900">
                                                {selectedStudent.tempatLahir}, {selectedStudent.tanggalLahir ? new Date(selectedStudent.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Jenis Kelamin</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{selectedStudent.gender || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Alamat</span>
                                            <span>:</span>
                                            <span className="text-slate-900 block w-full">{selectedStudent.alamatLengkap || "-"}</span>
                                        </div>
                                        <div className="grid grid-cols-[180px_10px_1fr] border-b border-slate-100 pb-2 print:grid-cols-[140px_10px_1fr] print:pb-1">
                                            <span className="font-bold text-slate-700">Waktu Pendaftaran</span>
                                            <span>:</span>
                                            <span className="text-slate-900">{new Date(selectedStudent.createdAt).toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl print:bg-slate-50 print:border-slate-300 print:p-4">
                                        <h4 className="font-bold text-sm text-slate-900 mb-4 tracking-wide uppercase print:mb-2 text-xs">Kelengkapan Dokumen:</h4>
                                        <div className="grid grid-cols-2 gap-y-3 gap-x-8 print:gap-y-2 print:gap-x-4">
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${selectedStudent.documents?.fileAkta ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {selectedStudent.documents?.fileAkta && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Akta Kelahiran</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${selectedStudent.documents?.fileKK ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {selectedStudent.documents?.fileKK && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Kartu Keluarga</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${selectedStudent.documents?.fileSKL ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {selectedStudent.documents?.fileSKL && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Surat Keterangan Lulus</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${selectedStudent.documents?.fileRaport ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {selectedStudent.documents?.fileRaport && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Raport</span>
                                            </div>
                                            <div className="flex items-center gap-3 print:gap-2">
                                                <div className={`flex items-center justify-center size-5 rounded border ${selectedStudent.documents?.pasFoto ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300'}`}>
                                                    {selectedStudent.documents?.pasFoto && <span className="material-symbols-outlined text-[16px] font-bold">check</span>}
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">Pas Foto</span>
                                            </div>
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
                                <div className="mt-16 flex justify-end print:mt-8">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-slate-700 mb-16 print:mb-12 print:text-xs">
                                            Kota Merdeka, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                                            Petugas Pendaftaran,
                                        </p>
                                        <div className="h-0 border-b-[1.5px] border-slate-900 w-48 mx-auto mb-2 print:w-32"></div>
                                        <p className="text-[10px] font-mono text-slate-400">Dicetak Otomatis oleh Sistem PPDB</p>
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
