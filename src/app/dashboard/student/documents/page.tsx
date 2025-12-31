import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentSelector from "@/components/StudentSelector";
import DocumentUploadButton from "@/components/DocumentUploadButton";

interface Student {
    id: string;
    namaLengkap: string;
    nisn: string;
    asalSekolah: string | null;
    tempatLahir: string | null;
    tanggalLahir: Date | null;
    alamatLengkap: string | null;
    documents: any;
    [key: string]: any;
}

export default async function DocumentUploadPage({
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
        return (
            <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
                <div className="max-w-[960px] mx-auto w-full text-center py-20">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                        <span className="material-symbols-outlined text-4xl">person_off</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Belum Ada Siswa
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                        Anda belum mendaftarkan siswa. Silakan tambahkan data siswa terlebih
                        dahulu sebelum mengunggah dokumen.
                    </p>
                    <a
                        href="/dashboard/student/add"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-all"
                    >
                        <span className="material-symbols-outlined">add</span>
                        Tambah Siswa Baru
                    </a>
                </div>
            </div>
        );
    }

    // Determine selected student
    const resolvedParams = await searchParams;
    const studentIdParam = resolvedParams?.studentId;
    const selectedStudentId = Array.isArray(studentIdParam)
        ? studentIdParam[0]
        : studentIdParam || students[0].id;

    const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];
    const docs = selectedStudent.documents || {};

    // Helper to check if file already exists
    const renderUploadSection = (
        type: "fileAkta" | "fileKK" | "fileSKL" | "fileRaport" | "pasFoto",
        title: string,
        desc: string,
        icon: string,
        isRequired = true
    ) => {
        const fileUrl = docs[type];
        const isUploaded = !!fileUrl;

        return (
            <div className={`flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1A2632] p-4 rounded-xl shadow-sm border ${isUploaded ? 'border-green-200 dark:border-green-900/30' : 'border-slate-200 dark:border-slate-800'} items-start md:items-center justify-between group hover:border-primary/50 transition-colors`}>
                <div className="flex items-start gap-4 w-full md:w-auto">
                    <div className={`flex items-center justify-center rounded-lg shrink-0 size-12 ${isUploaded ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-primary/10 text-primary'}`}>
                        <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div className="flex flex-col justify-center gap-1">
                        <p className="text-slate-900 dark:text-white text-base font-bold leading-normal">
                            {title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            {isRequired && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 font-medium">
                                    Wajib
                                </span>
                            )}
                            <p className="text-slate-500 dark:text-slate-400">
                                {desc}
                            </p>
                        </div>
                        <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${isUploaded ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                            {isUploaded ? (
                                <>
                                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    Status: Berhasil Diunggah
                                </>
                            ) : (
                                <>
                                    <span className="size-2 rounded-full bg-slate-300"></span>
                                    Status: Belum Diunggah
                                </>
                            )}
                        </p>
                    </div>
                </div>
                <div className="w-full md:w-auto shrink-0 mt-2 md:mt-0 flex gap-2">
                    {isUploaded ? (
                        <>
                            <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-1 md:flex-none cursor-pointer items-center justify-center rounded-lg h-9 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-200 dark:border-slate-700 transition-colors text-decoration-none"
                            >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                <span className="ml-2 md:hidden">Lihat</span>
                            </a>
                            {/* Re-upload button */}
                            <div className="w-full md:w-auto">
                                <DocumentUploadButton
                                    studentId={selectedStudent.id}
                                    documentType={type}
                                    label={title}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="w-full md:w-auto">
                            <DocumentUploadButton
                                studentId={selectedStudent.id}
                                documentType={type}
                                label={title}
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const isComplete = docs.fileAkta && docs.fileKK && docs.fileSKL && docs.fileRaport && docs.pasFoto;

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark p-6 lg:px-12 lg:py-8">
            <div className="max-w-[960px] mx-auto space-y-6 w-full">
                {/* Page Heading */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                        Unggah Dokumen Siswa
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
                        Silakan unggah dokumen digital untuk kelengkapan administrasi calon
                        siswa baru.
                    </p>
                </div>

                {/* Student Selector (only if multiple) */}
                <StudentSelector
                    students={students.map((s) => ({
                        id: s.id,
                        namaLengkap: s.namaLengkap,
                        nisn: s.nisn,
                    }))}
                    currentStudentId={selectedStudent.id}
                />

                {/* Student Profile Card */}
                <div className="flex flex-col md:flex-row p-6 bg-white dark:bg-[#1A2632] rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 gap-6 items-start md:items-center">
                    <div
                        className="bg-slate-200 dark:bg-slate-700 rounded-lg w-24 h-24 shrink-0 shadow-inner flex items-center justify-center bg-center bg-cover border border-slate-100 dark:border-slate-600"
                        style={{
                            backgroundImage: docs.pasFoto ? `url('${docs.pasFoto}')` : `url('https://ui-avatars.com/api/?name=${encodeURIComponent(
                                selectedStudent.namaLengkap
                            )}&background=random')`,
                        }}
                    ></div>
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                            <div>
                                <p className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                                    {selectedStudent.namaLengkap}
                                </p>
                                <p className="text-primary font-medium text-sm mt-1">
                                    NISN: {selectedStudent.nisn}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isComplete ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {isComplete ? "Dokumen Lengkap" : "Dokumen Belum Lengkap"}
                            </span>
                        </div>
                        <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                            <p>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Asal Sekolah:
                                </span>{" "}
                                {selectedStudent.asalSekolah || "-"}
                            </p>
                            <p>
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                    Tempat/Tgl Lahir:
                                </span>{" "}
                                {selectedStudent.tempatLahir},{" "}
                                {selectedStudent.tanggalLahir
                                    ? new Date(selectedStudent.tanggalLahir).toLocaleDateString("id-ID")
                                    : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Document List Section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        Daftar Dokumen
                    </h3>

                    {renderUploadSection(
                        "pasFoto",
                        "Pas Foto (3x4)",
                        "Latar belakang merah/biru. Format JPG/PNG, Max 2MB.",
                        "account_circle"
                    )}

                    {renderUploadSection(
                        "fileAkta",
                        "Akta Kelahiran",
                        "Format PDF/JPG, Max 2MB.",
                        "description"
                    )}

                    {renderUploadSection(
                        "fileKK",
                        "Kartu Keluarga (KK)",
                        "Scan asli kartu keluarga terbaru.",
                        "group"
                    )}

                    {renderUploadSection(
                        "fileSKL",
                        "Surat Keterangan Lulus (SKL)",
                        "Dari sekolah asal.",
                        "school"
                    )}

                    {renderUploadSection(
                        "fileRaport",
                        "Nilai Raport Kelas 5",
                        "Semester 1 & 2 digabung dalam 1 file PDF.",
                        "analytics"
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="sticky bottom-0 bg-background-light/95 dark:bg-slate-900/95 backdrop-blur-sm py-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-between gap-4 z-10">
                    <a href="/dashboard" className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold leading-normal border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm w-full md:w-auto text-decoration-none">
                        Kembali
                    </a>
                    {isComplete ? (
                        <a
                            href="/dashboard/student/finalize"
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg h-12 px-8 bg-primary hover:bg-blue-600 text-white text-base font-bold leading-normal transition-colors shadow-md shadow-blue-500/20 w-full md:w-auto text-decoration-none"
                        >
                            <span>Simpan & Lanjutkan</span>
                            <span className="material-symbols-outlined text-[20px]">
                                arrow_forward
                            </span>
                        </a>
                    ) : (
                        <button
                            disabled
                            className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg h-12 px-8 bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600 text-base font-bold leading-normal w-full md:w-auto"
                        >
                            <span>Lengkapi Dokumen Dahulu</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
