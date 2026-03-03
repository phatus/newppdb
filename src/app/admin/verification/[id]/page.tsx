import { db } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import DocumentList from "@/components/admin/DocumentList";
import EditableGradeTable from "@/components/admin/EditableGradeTable";
import { getFileUrl } from "@/lib/utils";
import ContactWAButton from "@/components/admin/ContactWAButton";
import BioDataEditor from "@/components/admin/BioDataEditor";

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
        where: {
            isActive: true,
            NOT: {
                name: { contains: "Kelas 6 Semester 2" }
            }
        },
        orderBy: { order: 'asc' }
    });

    return { student, subjects, semesters };
}

const getDocumentList = (docs: any, jalur: string | null) => {
    const list = [
        { key: 'fileKK', label: 'Kartu Keluarga (KK)', icon: 'badge' },
        { key: 'fileAkta', label: 'Akta Kelahiran', icon: 'child_care' },

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
                <EditableGradeTable
                    studentId={student.id}
                    subjects={subjects}
                    semesters={semesters}
                    initialGradesMap={gradesMap}
                    semesterAverageMap={semesterAverageMap}
                    totalAverage={student.grades?.rataRataNilai || 0}
                    fileRaport={student.documents?.fileRaport}
                    jenjang={student.jenjang}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Data Murid Card (Editable) */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <BioDataEditor student={student} />
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
