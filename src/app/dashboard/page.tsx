

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import StudentCard from "@/components/StudentCard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    // Fetch user details including all students
    const user = await db.user.findUnique({
        where: { email: session?.user?.email! },
        include: {
            students: {
                orderBy: { createdAt: 'desc' },
                include: {
                    documents: true,
                }
            }
        }
    });

    const studentList = user?.students || [];

    // Calculate Stats
    const totalStudents = studentList.length;
    const pendingStudents = studentList.filter(s => s.statusVerifikasi === "PENDING").length;
    const verifiedStudents = studentList.filter(s => s.statusVerifikasi === "VERIFIED").length;

    // Determine welcome name
    const welcomeName = session?.user?.email || "Orang Tua";

    // Helper for formatting date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-tight">
                        Selamat Datang, {welcomeName}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal max-w-2xl">
                        Pantau status pendaftaran putra-putri Anda untuk Tahun Pelajaran 2024/2025. Cek notifikasi secara berkala.
                    </p>
                </div>
                <Link href="/dashboard/student/add">
                    <button className="flex-shrink-0 flex items-center gap-2 cursor-pointer justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 text-sm font-bold leading-normal tracking-wide transition-all">
                        <span className="material-symbols-outlined text-[20px]">person_add</span>
                        <span className="truncate">Tambah Siswa Baru</span>
                    </button>
                </Link>
            </header>

            {/* Stats Cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <span className="material-symbols-outlined">assignment_ind</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Total Siswa</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight">{totalStudents}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Siswa terdaftar dalam akun ini</p>
                </div>
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            <span className="material-symbols-outlined">hourglass_top</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Menunggu</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight">{pendingStudents}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Proses verifikasi dokumen</p>
                </div>
                <div className="flex flex-col gap-3 rounded-xl p-6 bg-white dark:bg-[#1c2936] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <span className="material-symbols-outlined">verified</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">Terverifikasi</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-3xl font-black leading-tight">{verifiedStudents}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Siap cetak kartu ujian</p>
                </div>
            </section>

            {/* Student List */}
            <section className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="text-slate-900 dark:text-white text-2xl font-bold leading-tight">Daftar Calon Peserta Didik</h2>
                </div>

                <div className="flex flex-col gap-4">
                    {studentList.length === 0 ? (
                        <div className="p-8 text-center bg-white dark:bg-[#1c2936] rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <span className="material-symbols-outlined text-3xl">person_off</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum ada data siswa</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-6">Silakan tambahkan data calon siswa baru terlebih dahulu.</p>
                            <Link href="/dashboard/student/add">
                                <button className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors">
                                    Tambah Siswa
                                </button>
                            </Link>
                        </div>
                    ) : (
                        studentList.map((student) => (
                            <StudentCard
                                key={student.id}
                                student={{
                                    ...student,
                                    createdAt: student.createdAt.toISOString(),
                                    updatedAt: student.updatedAt.toISOString(),
                                    tanggalLahir: student.tanggalLahir ? student.tanggalLahir.toISOString() : null,
                                }}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Help Section */}
            <section className="mt-8 mb-4 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 border border-primary/10 dark:border-primary/20">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-white dark:bg-[#1c2936] rounded-full text-primary shadow-sm">
                            <span className="material-symbols-outlined">support_agent</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <h4 className="text-slate-900 dark:text-white font-bold text-lg">Butuh Bantuan?</h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-lg">
                                Jika Anda mengalami kesulitan dalam proses pendaftaran atau verifikasi dokumen, tim support kami siap membantu Anda.
                            </p>
                        </div>
                    </div>
                    <button className="whitespace-nowrap flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#1c2936] text-slate-900 dark:text-white font-bold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        Hubungi Admin
                    </button>
                </div>
            </section>
        </div>
    );
}
