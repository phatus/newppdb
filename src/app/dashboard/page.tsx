

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentCard from "@/components/StudentCard";

import { getAnnouncements } from "@/app/actions/announcements";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { getActiveWave } from "@/app/actions/waves";
import ReRegistrationModal from "@/components/dashboard/ReRegistrationModal"; // Ensure this path is correct
import StudentListManager from "@/components/dashboard/StudentListManager";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Fetch user details
    const user = await db.user.findUnique({
        where: { email: session?.user?.email! },
        include: {
            students: {
                orderBy: { createdAt: 'desc' },
                include: {
                    documents: true,
                    history: { orderBy: { createdAt: 'desc' } }, // Add history
                    grades: {
                        include: {
                            semesterGrades: {
                                include: {
                                    entries: true
                                }
                            }
                        }
                    },
                }
            }
        }
    });

    // Fetch Active Announcements
    const announcements = await getAnnouncements(false); // only active

    // Fetch School Settings
    const settings = await db.schoolSettings.findFirst();
    const academicYear = settings?.academicYear || "2024/2025";
    const activeWave = await getActiveWave(); // Fetch active wave


    const studentList = user?.students || [];

    // Calculate Stats
    const totalStudents = studentList.length;
    const pendingStudents = studentList.filter(s => s.statusVerifikasi === "PENDING").length;
    const verifiedStudents = studentList.filter(s => s.statusVerifikasi === "VERIFIED").length;

    // Determine welcome name
    const welcomeName = session?.user?.email || "Orang Tua";

    return (
        <div className="flex flex-col gap-6 max-w-[1240px] mx-auto w-full p-4 sm:p-0">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="flex flex-col gap-1">
                    <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">
                        Selamat Datang, <span className="text-primary">{welcomeName}</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal max-w-xl">
                        Tahun Pelajaran {academicYear} • Pantau status pendaftaran secara berkala.
                    </p>
                </div>
                <Link href="/dashboard/student/add">
                    <button className="flex-shrink-0 flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-xl h-11 px-5 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-xs font-bold leading-normal transition-all">
                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                        <span className="truncate">Tambah Siswa Baru</span>
                    </button>
                </Link>
            </header>

            {/* Announcements Banner */}
            <div className="scale-95 origin-center -my-2">
                <AnnouncementBanner announcements={announcements} />
            </div>

            {/* Incomplete Data Warning Banner */}
            {studentList.map(student => {
                // Graduation Announcement (Global only for single student)
                if (student.statusKelulusan === "LULUS") {
                    if (totalStudents > 1) return null;

                    return (
                        <div key={`grad-${student.id}`} className="bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm border-y border-r border-emerald-200 dark:border-emerald-800 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800/40 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">celebration</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                                        Selamat! {student.namaLengkap} Dinyatakan LULUS
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Selamat, Anda dinyatakan <strong>LULUS</strong> seleksi Penerimaan Peserta Didik Baru Tahun Pelajaran {academicYear} pada Jalur <strong>{student.jalur.replace(/_/g, " ")}</strong>.
                                        Silakan cek menu pengumuman secara berkala untuk informasi daftar ulang.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                } else if (student.statusKelulusan === "TIDAK_LULUS") {
                    if (totalStudents > 1) return null;

                    return (
                        <div key={`grad-${student.id}`} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-xl shadow-sm border-y border-r border-red-200 dark:border-red-800 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-100 dark:bg-red-800/40 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-[24px]">sentiment_dissatisfied</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">
                                        Mohon Maaf, {student.namaLengkap} Belum Lulus
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        Mohon maaf, Anda dinyatakan <strong>TIDAK LULUS</strong> seleksi PPDB tahun ini.
                                        Jangan berkecil hati dan tetap semangat dalam menuntut ilmu di tempat lain.
                                    </p>

                                    {/* Re-registration Check */}
                                    {activeWave && activeWave.id !== student.waveId && (
                                        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                                                Kabar Baik! Pendaftaran {activeWave.name} Telah Dibuka.
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                Anda dapat mencoba mendaftar kembali di gelombang ini.
                                            </p>
                                            <ReRegistrationModal
                                                studentId={student.id}
                                                studentName={student.namaLengkap}
                                                activeWaveName={activeWave.name}
                                                allowedJalur={activeWave.jalurAllowed as string[] || []}
                                            />
                                        </div>
                                    )}

                                    {/* History Check */}
                                    {student.history && student.history.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Riwayat Pendaftaran</h4>
                                            <div className="space-y-2">
                                                {student.history.map(hist => (
                                                    <div key={hist.id} className="flex flex-col text-xs bg-white/50 p-2 rounded border border-red-200">
                                                        <div className="flex justify-between">
                                                            <span className="font-bold">{hist.jalur.replace(/_/g, " ")}</span>
                                                            <span className="text-red-600 font-bold">{hist.status}</span>
                                                        </div>
                                                        <span className="text-slate-500">{new Date(hist.createdAt).toLocaleDateString("id-ID", { dateStyle: 'medium' })}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }

                // Incomplete Data Warning (Existing Logic)
                const missingDocs = [];
                const docs = student.documents;
                if (!docs?.fileKK) missingDocs.push("Kartu Keluarga");
                if (!docs?.fileAkta) missingDocs.push("Akta Kelahiran");
                // Check Raport (Only for PRESTASI_AKADEMIK)
                if (student.jalur === "PRESTASI_AKADEMIK" && !docs?.fileRaport) missingDocs.push("Raport (PDF)");
                if (!docs?.pasFoto) missingDocs.push("Pas Foto");

                // Check Grades
                const isPrestasiAkademik = student.jalur === "PRESTASI_AKADEMIK";
                const gradeCount = student.grades?.semesterGrades?.length || 0;
                // If not prestasi akademik, grades are considered "complete" for this check (as they are not required)
                const gradesComplete = isPrestasiAkademik ? gradeCount >= 5 : true; // Assuming 5 semesters required

                if (missingDocs.length === 0 && gradesComplete) return null;

                return (
                    <div key={student.id} className="bg-white dark:bg-[#1e293b] border-l-4 border-amber-500 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-amber-600 dark:text-amber-500 text-[20px]">warning</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base mb-0.5">
                                    Lengkapi Data: {student.namaLengkap}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mb-3">
                                    Mohon lengkapi data berikut agar pendaftaran dapat segera kami verifikasi.
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {isPrestasiAkademik && !gradesComplete && (
                                        <span className="px-2 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-100 dark:border-amber-800">Nilai Raport</span>
                                    )}
                                    {missingDocs.map((doc, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-md border border-slate-100 dark:border-slate-700">Dokumen: {doc}</span>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {isPrestasiAkademik && !gradesComplete && (
                                        <Link href={`#`} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm shadow-amber-900/20">
                                            <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                            Input Nilai
                                        </Link>
                                    )}
                                    {missingDocs.length > 0 && (
                                        <Link href={`/dashboard/student/documents?studentId=${student.id}`} className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700">
                                            <span className="material-symbols-outlined text-[14px]">upload_file</span>
                                            Upload Dokumen
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-primary rounded-lg">
                            <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Total Siswa</p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{totalStudents}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Siswa terdaftar</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                            <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Menunggu</p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{pendingStudents}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium font-medium">Verifikasi berkas</p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg">
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">Terverifikasi</p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">{verifiedStudents}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Siap cetak kartu</p>
                    </div>
                </div>
            </section>

            {/* Student List */}
            <StudentListManager students={studentList} showGraduationStatus={totalStudents > 1} />

            {/* Help Section */}
            <section className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white dark:from-[#1e293b] dark:to-[#101a22] border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-primary border border-blue-100 dark:border-blue-800">
                            <span className="material-symbols-outlined text-[20px]">support_agent</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h4 className="text-slate-900 dark:text-white font-bold text-base">Butuh Bantuan Teknis?</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-xs max-w-lg leading-relaxed">
                                Jika Anda mengalami kendala saat upload dokumen atau verifikasi, tim kami siap mendampingi Anda hingga selesai.
                            </p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap flex items-center gap-2 px-5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                        Hubungi Admin
                    </button>
                </div>
            </section>
        </div>
    );
}
