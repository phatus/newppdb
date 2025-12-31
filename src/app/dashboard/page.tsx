

import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
                        studentList.map((student) => {
                            const isVerified = student.statusVerifikasi === "VERIFIED";
                            const isRejected = student.statusVerifikasi === "REJECTED";
                            const isPending = student.statusVerifikasi === "PENDING";

                            return (
                                <div key={student.id} className={`group flex flex-col md:flex-row items-stretch gap-6 rounded-xl bg-white dark:bg-[#1c2936] p-5 shadow-sm border ${isRejected ? 'border-red-200 dark:border-red-900 hover:border-red-500' : isVerified ? 'border-emerald-200 dark:border-emerald-900 hover:border-emerald-500' : 'border-slate-200 dark:border-slate-700 hover:border-amber-400'} transition-all`}>
                                    <div
                                        className={`w-full md:w-48 aspect-[4/3] md:aspect-square bg-center bg-no-repeat bg-cover rounded-lg flex-shrink-0 bg-slate-200 dark:bg-slate-700 ${isRejected ? 'grayscale opacity-80' : ''}`}
                                        style={{ backgroundImage: `url('https://ui-avatars.com/api/?name=${encodeURIComponent(student.namaLengkap)}&background=random')` }} // Placeholder or real image if available
                                    ></div>

                                    <div className="flex flex-1 flex-col justify-between gap-4">
                                        <div className="flex flex-col gap-2">
                                            {/* Status Badge */}
                                            <div className="flex flex-wrap items-center gap-2">
                                                {isVerified && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                        <span className="material-symbols-outlined text-[14px]">verified</span>
                                                        Terverifikasi
                                                    </span>
                                                )}
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                        <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                                                        Menunggu Verifikasi
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800">
                                                        <span className="material-symbols-outlined text-[14px]">cancel</span>
                                                        Ditolak
                                                    </span>
                                                )}
                                                <span className="text-slate-400 dark:text-slate-500 text-xs font-medium">
                                                    Update: {formatDate(student.updatedAt)}
                                                </span>
                                            </div>

                                            {/* Rejection Message */}
                                            {isRejected && student.catatanPenolakan && (
                                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800/50 mt-1">
                                                    <p className="text-xs md:text-sm text-red-800 dark:text-red-200 font-medium flex items-start gap-2">
                                                        <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
                                                        Alasan: {student.catatanPenolakan}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Name and Actions */}
                                            <div className="mt-1">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <h3 className="text-slate-900 dark:text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                                                        {student.namaLengkap}
                                                    </h3>
                                                    {isVerified && (
                                                        <Link href="/dashboard/student/exam-card">
                                                            <button className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm transform active:scale-95">
                                                                <span className="material-symbols-outlined text-[16px]">print</span>
                                                                Cetak Kartu Ujian
                                                            </button>
                                                        </Link>
                                                    )}
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">NISN: {student.nisn}</p>
                                            </div>

                                            {/* School Info */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1">
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">school</span>
                                                    <span>{student.asalSekolah || "Asal Sekolah Belum Diisi"}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
                                                    <span>{student.alamatLengkap ? "Alamat Terisi" : "Alamat Belum Diisi"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Bottom Action Buttons */}
                                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            {isRejected ? (
                                                <Link href="/dashboard/student/add"> {/* Should ideally link to edit specific student */}
                                                    <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors shadow-sm shadow-primary/30">
                                                        Perbaiki Data
                                                    </button>
                                                </Link>
                                            ) : (
                                                <Link href="/dashboard/student/add">
                                                    <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors">
                                                        Lihat Detail / Edit
                                                    </button>
                                                </Link>
                                            )}

                                            <Link href="/dashboard/student/documents">
                                                <button className="flex items-center justify-center gap-2 rounded-lg h-9 px-4 bg-white border border-slate-200 hover:bg-slate-50 dark:bg-transparent dark:border-slate-600 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">description</span>
                                                    Dokumen
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
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
