import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentList from "@/components/admin/DocumentList";

interface PageProps {
    params: {
        id: string;
    }
}

// 1. Fetcher with Deep Includes
async function getVerificationData(id: string) {
    const student = await db.student.findUnique({
        where: { id },
        include: {
            user: {
                select: { email: true }
            },
            documents: true,
            grades: {
                include: {
                    semesterGrades: {
                        include: {
                            entries: {
                                include: {
                                    subject: true
                                }
                            },
                            semester: true
                        },
                        orderBy: {
                            semester: {
                                order: 'asc'
                            }
                        }
                    }
                }
            }
        }
    });

    if (!student) return null;

    // Fetch Active Subjects for Columns (Ordered)
    const subjects = await db.subject.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    // Fetch All Semesters for Headers (Ordered)
    const semesters = await db.semester.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });

    return { student, subjects, semesters };
}

const getDocumentList = (docs: any, jalur: string | null) => {
    const list = [
        { key: 'fileKK', label: 'Kartu Keluarga (KK)', icon: 'badge' },
        { key: 'fileAkta', label: 'Akta Kelahiran', icon: 'child_care' },
        { key: 'fileSKL', label: 'Surat Keterangan Lulus', icon: 'school' },
        { key: 'fileRaport', label: 'Raport', icon: 'menu_book' },
        { key: 'pasFoto', label: 'Pas Foto', icon: 'account_box' },
    ];
    if (jalur === 'PRESTASI_AKADEMIK' || jalur === 'PRESTASI_NON_AKADEMIK' || (docs && docs.filePrestasi)) {
        list.push({ key: 'filePrestasi', label: 'Dokumen Prestasi', icon: 'emoji_events' });
    }
    return list;
};

export default async function VerificationDetailPage({ params }: any) {
    const { id } = await params;

    // 2. Use Data Fetcher
    const data = await getVerificationData(id);
    if (!data) return notFound();

    const { student, subjects, semesters } = data;
    const docList = getDocumentList(student.documents, student.jalur);

    // 3. Transform Grade Data for Easy Access: map[semesterId][subjectId] = score
    const gradesMap: Record<string, Record<string, number>> = {};
    const semesterAverageMap: Record<string, number> = {};

    student.grades?.semesterGrades?.forEach((sg: any) => {
        gradesMap[sg.semesterId] = {};
        semesterAverageMap[sg.semesterId] = sg.rataRataSemester;

        sg.entries.forEach((entry: any) => {
            gradesMap[sg.semesterId][entry.subjectId] = entry.score;
        });
    });

    return (
        <div className="p-6 w-full max-w-[1400px] mx-auto flex flex-col gap-6">
            <div className="mb-2">
                <Link href="/admin/verification" className="text-slate-500 hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors w-fit">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Kembali ke Data Pendaftar
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Verifikasi Dokumen
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Validasi kelengkapan dan keabsahan dokumen murid.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/admin/print/registration-proof/${student.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                        Cetak Bukti Pendaftaran
                    </Link>
                    {student.statusVerifikasi === 'VERIFIED' && (
                        <Link
                            href={`/admin/print/exam-card/${student.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[16px]">badge</span>
                            Cetak Kartu Ujian
                        </Link>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.statusVerifikasi === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' :
                        student.statusVerifikasi === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        Status: {student.statusVerifikasi || 'Pending'}
                    </span>
                </div>
            </div>

            {/* Split View Container for Grades */}
            <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-purple-600">analytics</span>
                            Verifikasi Nilai Raport
                        </h3>
                        <div className="text-sm text-slate-500">
                            Total Rata-Rata: <span className="font-bold text-slate-900 dark:text-white">{student.grades?.rataRataNilai?.toFixed(2) || "-"}</span>
                        </div>
                    </div>

                    <div className="p-0 grid grid-cols-1 xl:grid-cols-2 h-[600px] divide-y xl:divide-y-0 xl:divide-x divide-slate-200 dark:divide-slate-700">
                        {/* Left: PDF Viewer */}
                        <div className="relative h-[600px] w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                            {student.documents?.fileRaport ? (
                                <iframe
                                    src={`${student.documents.fileRaport}#toolbar=0`}
                                    className="w-full h-full"
                                    title="Raport PDF"
                                />
                            ) : (
                                <div className="text-center p-8">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">picture_as_pdf</span>
                                    <p className="text-slate-500">Dokumen Raport (PDF) belum diunggah.</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Grades Table */}
                        <div className="p-6 overflow-auto h-full">
                            <p className="text-sm text-slate-500 mb-4 px-1">
                                Cocokkan nilai yang diinput di bawah ini dengan dokumen di samping.
                            </p>

                            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-700 bg-slate-50 dark:bg-slate-800 dark:text-slate-300">
                                        <tr>
                                            <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800 z-10 border-r border-slate-200 dark:border-slate-700">Mata Pelajaran</th>
                                            {/* Dynamic Headers */}
                                            {semesters.map((sem: any) => (
                                                <th key={sem.id} className="px-4 py-3 text-center whitespace-nowrap min-w-[80px]">
                                                    {sem.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {/* Dynamic Subjects */}
                                        {subjects.map((subj: any) => (
                                            <tr key={subj.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <th className="px-4 py-2 font-medium text-slate-900 dark:text-white sticky left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 truncate max-w-[150px]" title={subj.name}>
                                                    {subj.name}
                                                </th>
                                                {semesters.map((sem: any) => {
                                                    const score = gradesMap[sem.id]?.[subj.id];
                                                    return (
                                                        <td key={sem.id} className={`px-4 py-2 text-center ${score !== undefined ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 dark:text-slate-600'}`}>
                                                            {score !== undefined ? score : "-"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}

                                        {/* Semester Average Row */}
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 font-bold border-t-2 border-slate-200 dark:border-slate-700">
                                            <td className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700">Rata-Rata</td>
                                            {semesters.map((sem: any) => (
                                                <td key={sem.id} className="px-4 py-3 text-center text-primary">
                                                    {semesterAverageMap[sem.id]?.toFixed(2) || "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Data Murid Card */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Data Murid
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                                        {student.documents?.pasFoto ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={student.documents.pasFoto} alt="Pas Foto" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-4xl text-slate-400">person</span>
                                        )}
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center">{student.namaLengkap}</h2>
                                    <p className="text-slate-500 text-sm">NISN: {student.nisn}</p>
                                </div>
                                <dl className="grid grid-cols-1 gap-y-4">
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">NISN</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{student.nisn}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Tempat, Tanggal Lahir</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                                            {student.tempatLahir}, {student.tanggalLahir ? new Date(student.tanggalLahir).toLocaleDateString('id-ID') : '-'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Asal Sekolah</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{student.asalSekolah || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Jalur Pendaftaran</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{student.jalur?.replace('_', ' ') || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Alamat</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{student.alamatLengkap || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Email Pendaftaran</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white break-all">{student.user?.email || '-'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-medium text-slate-500">Nomor Telepon</dt>
                                        <dd className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{student.telepon || '-'}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>

                    {/* Document Verification List */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                    Dokumen Persyaratan
                                </h3>
                            </div>

                            <DocumentList student={student} docList={docList} studentId={student.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
