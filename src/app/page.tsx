
import { db } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import QuotaInfo from "@/components/public/QuotaInfo";

// Helper to get icon based on title keywords or index
const getIcon = (title: string, index: number) => {
  const t = title.toLowerCase();
  if (t.includes('daftar') || t.includes('regis')) return 'app_registration';
  if (t.includes('verifikasi') || t.includes('validasi')) return 'fact_check';
  if (t.includes('pengumuman') || t.includes('hasil')) return 'campaign';
  if (t.includes('ulang') || t.includes('masuk')) return 'school';

  const icons = ['event', 'schedule', 'today', 'calendar_month'];
  return icons[index % icons.length];
}

const getDefaultSchedule = () => [
  { id: "1", title: "Pendaftaran Online", date: "1 - 5 Juli 2024", description: "Calon peserta didik melakukan pembuatan akun dan pengisian formulir pendaftaran secara mandiri melalui laman website." },
  { id: "2", title: "Verifikasi & Validasi Berkas", date: "2 - 6 Juli 2024", description: "Panitia PPDB sekolah melakukan verifikasi berkas yang telah diunggah oleh calon peserta didik." },
  { id: "3", title: "Pengumuman Hasil Seleksi", date: "8 Juli 2024", description: "Pengumuman hasil seleksi dapat dilihat melalui akun masing-masing peserta atau di papan pengumuman sekolah." },
  { id: "4", title: "Daftar Ulang", date: "9 - 11 Juli 2024", description: "Peserta didik yang diterima wajib melakukan daftar ulang dengan membawa berkas fisik asli ke sekolah." },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  const settings = await db.schoolSettings.findFirst();
  // Safe cast or parsing
  const rawSchedule = settings?.ppdbSchedule;
  const schedule = (Array.isArray(rawSchedule) && rawSchedule.length > 0)
    ? rawSchedule as any[]
    : getDefaultSchedule();

  return (
    <div className="min-h-screen font-sans bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-200">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#101a22]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 text-primary flex items-center justify-center">
                {settings?.schoolLogo ? (
                  <img src={settings.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <img src="/uploads/school_logo_1767362065250.png" alt="Logo" className="w-full h-full object-contain" />
                )}
              </div>
              <div className="flex flex-col">
                <h1 className="text-slate-900 dark:text-white text-lg sm:text-xl font-bold leading-tight tracking-tight">
                  {settings?.schoolName || "PPDB SMP 2024"}
                </h1>
                <span className="text-slate-500 dark:text-slate-400 text-xs font-medium hidden sm:block">
                  Kementerian Agama Kabupaten Pacitan
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors" href="#beranda">
                Beranda
              </Link>
              <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors" href="#jadwal">
                Jadwal
              </Link>
              <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors" href="#syarat">
                Persyaratan
              </Link>
              <Link className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm font-semibold transition-colors" href="#alur">
                Alur
              </Link>
            </div>
            <div className="hidden md:flex gap-3">
              <Link href="/auth/login">
                <button className="h-10 px-5 text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  Login
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="h-10 px-5 text-sm font-bold text-white bg-primary hover:bg-blue-600 rounded-lg shadow-sm shadow-blue-200 dark:shadow-none transition-colors">
                  Registrasi Akun
                </button>
              </Link>
            </div>
            <div className="md:hidden">
              <button className="text-slate-600 dark:text-slate-300 p-2">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background-light dark:bg-background-dark py-8 sm:py-16" id="beranda">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl overflow-hidden relative min-h-[500px] flex items-center justify-center text-center p-8 sm:p-12 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url('/uploads/madrasah_bg_modern_v2.jpg')`,
            }}
          >
            <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                Portal Resmi PPDB {settings?.academicYear || "2026"}
              </div>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight drop-shadow-sm">
                Masa Depan Cerah Dimulai Di Sini
              </h1>
              <p className="text-slate-200 text-base sm:text-lg font-normal leading-relaxed max-w-2xl drop-shadow-sm">
                Selamat datang di portal Penerimaan Peserta Didik Baru {settings?.schoolName || "MTs"}. Sistem seleksi yang transparan, objektif, dan akuntabel untuk generasi penerus bangsa.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link href="/auth/register">
                  <button className="h-12 px-8 bg-primary hover:bg-blue-600 text-white text-base font-bold rounded-lg shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105">
                    Registrasi Akun
                  </button>
                </Link>
                <Link href="/auth/login">
                  <button className="h-12 px-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white text-base font-bold rounded-lg transition-all">
                    Login Siswa
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900" id="pengumuman">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <QuotaInfo />
        </div>
      </section>

      {/* Jadwal Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-[#101a22]" id="jadwal">
        <div className="max-w-[960px] mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
              Jadwal Penting Pelaksanaan PPDB
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Catat tanggal-tanggal penting berikut agar kamu tidak ketinggalan tahapan seleksi penerimaan peserta didik baru.
            </p>
          </div>
          <div className="bg-background-light dark:bg-[#15202b] rounded-2xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="grid grid-cols-[40px_1fr] gap-x-4 sm:gap-x-6">

              {schedule.map((event: any, index: number) => {
                const isLast = index === schedule.length - 1;
                return (
                  <div key={event.id} className="contents">
                    {/* Icon Column */}
                    <div className="flex flex-col items-center pt-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center z-10 shrink-0">
                        <span className="material-symbols-outlined text-xl">{getIcon(event.title, index)}</span>
                      </div>
                      {!isLast && <div className="w-0.5 bg-slate-200 dark:bg-slate-700 h-full grow my-2"></div>}
                    </div>

                    {/* Content Column */}
                    <div className={`${isLast ? 'pt-2' : 'pb-8 pt-2'}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{event.title}</h3>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary text-sm font-bold whitespace-nowrap">
                          {event.date}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
        </div>
      </section>

      {/* Syarat Section */}
      <section className="py-12 sm:py-20 bg-background-light dark:bg-background-dark" id="syarat">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                Persyaratan Umum
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                Dokumen dan syarat yang perlu dipersiapkan sebelum mendaftar.
              </p>
            </div>
            <button className="text-primary font-bold hover:underline inline-flex items-center gap-1">
              Lihat Juknis Lengkap <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">cake</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Batas Usia</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Berusia paling tinggi 15 (lima belas) tahun pada tanggal 1 Juli tahun berjalan.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ijazah / SKL</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Memiliki ijazah SD/sederajat atau dokumen lain yang menjelaskan telah menyelesaikan kelas 6 SD.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">family_restroom</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Kartu Keluarga</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Kartu Keluarga (KK) asli yang diterbitkan paling singkat 1 (satu) tahun sebelum tanggal pendaftaran.
              </p>
            </div>
            {/* Card 4 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">child_care</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Akta Kelahiran</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Akta kelahiran atau surat keterangan lahir yang dikeluarkan oleh pihak yang berwenang.
              </p>
            </div>
            {/* Card 5 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">book</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nilai Rapor</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Rapor dari kelas 5 semester 1,2 & kelas 6 semester 1.
              </p>
            </div>
            {/* Card 6 */}
            <div className="bg-white dark:bg-[#15202b] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Pas Foto</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Pas foto berwarna terbaru ukuran 3x4 cm untuk diunggah pada saat pendaftaran akun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alur Section */}
      <section className="py-12 sm:py-20 bg-white dark:bg-[#101a22]" id="alur">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold text-sm mb-2 block">
              Panduan Pendaftaran
            </span>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Alur Lengkap Pendaftaran
            </h2>
            <p className="text-slate-500 mt-2">
              Ikuti 7 langkah mudah untuk mendaftar sebagai peserta didik baru.
            </p>
          </div>
          <div className="relative">
            <div className="hidden lg:block absolute top-[40px] left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent z-0"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">person_add</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">1</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Membuat Akun</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Calon siswa/ Wali Murid membuat akun baru menggunakan email aktif dan password.
                </p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">login</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">2</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Login</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Masuk ke dalam sistem menggunakan akun yang telah dibuat sebelumnya.
                </p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">edit_document</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">3</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Daftar Calon Siswa</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Melengkapi formulir pendaftaran dengan data rinci calon siswa dan orang tua.
                </p>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">upload_file</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">4</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unggah Dokumen</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Mengunggah scan dokumen asli persyaratan (KK, Akta, dll) ke sistem.
                </p>
              </div>
              {/* Step 5 */}
              <div className="flex flex-col items-center text-center group lg:col-start-1">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">print</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">5</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cetak Bukti</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Mencetak bukti pendaftaran sebagai tanda bukti pengajuan data.
                </p>
              </div>
              {/* Step 6 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">verified_user</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">6</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Verifikasi Admin</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Admin Madrasah memverifikasi kesesuaian data dan dokumen yang diunggah.
                </p>
              </div>
              {/* Step 7 */}
              <div className="flex flex-col items-center text-center group">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white dark:bg-[#101a22] border-4 border-blue-50 dark:border-blue-900/30 text-primary flex items-center justify-center mb-6 shadow-sm group-hover:border-primary transition-colors duration-300 z-10 relative">
                    <span className="material-symbols-outlined text-3xl">badge</span>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm shadow-md">7</div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cetak Kartu Ujian</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm px-2">
                  Setelah diverifikasi, cetak kartu ujian untuk mengikuti seleksi selanjutnya.
                </p>
              </div>
              {/* CTA Box */}
              <div className="flex flex-col items-center justify-center text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-bold text-primary mb-3">Siap Mendaftar?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Pastikan semua berkas sudah siap sebelum memulai.
                </p>
                <Link href="/auth/register" className="w-full">
                  <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors w-full">
                    Mulai Pendaftaran
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-[960px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap untuk Masa Depanmu?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Jangan lewatkan kesempatan untuk bergabung dengan Madrasah impianmu. Pendaftaran sudah dibuka, segera siapkan berkasmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="h-12 px-8 bg-white text-primary text-base font-bold rounded-lg shadow-lg hover:bg-slate-50 transition-colors">
                Registrasi Akun
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="h-12 px-8 bg-blue-700 text-white border border-blue-600 text-base font-bold rounded-lg hover:bg-blue-600 transition-colors">
                Login Siswa
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">school</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-xl font-bold">
                  PPDB MTsN 1 Pacitan 2026
                </h2>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                Layanan resmi Penerimaan Peserta Didik Baru jenjang Madrasah Tsanawiyah Kabupaten.
              </p>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Informasi</h3>
              <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Beranda</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Jadwal Pelaksanaan</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Persyaratan & Aturan</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Statistik Pendaftar</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Jalur Pendaftaran</h3>
              <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a className="hover:text-primary transition-colors" href="#">Reguler</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Afirmasi</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Prestasi</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold mb-4">Kontak Bantuan</h3>
              <ul className="flex flex-col gap-3 text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-lg shrink-0">location_on</span>
                  <span>Jl. Samanhudi No 15 Pacitan</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg shrink-0">call</span>
                  <span>(021) 123-4567</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg shrink-0">mail</span>
                  <span>humas@mtsn1pacitan.sch.id</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 dark:text-slate-500 text-sm">© 2026 Madrasah Tsanawiyah Negeri 1 Pacitan. All rights reserved.</p>
            <div className="flex gap-4">
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
              </a>
              <a className="text-slate-400 hover:text-primary transition-colors" href="#">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.52c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fillRule="evenodd"></path></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
