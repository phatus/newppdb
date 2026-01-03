
import Link from "next/link";

export default function UserHelpPage() {
    // FAQ Data
    const faqs = [
        {
            q: "Bagaimana cara mencetak Kartu Ujian/Bukti Pendaftaran?",
            a: "Fungsi cetak kartu hanya akan muncul setelah data Anda diverifikasi oleh panitia. Pastikan status pendaftaran Anda sudah 'TERVERIFIKASI'."
        },
        {
            q: "Dokumen apa saja yang wajib diupload?",
            a: "Dokumen wajib meliputi Kartu Keluarga, Akta Kelahiran, dan Pas Foto. Untuk jalur prestasi, sertifikat pendukung juga diperlukan."
        },
        {
            q: "Mengapa status saya masih 'Menunggu Verifikasi'?",
            a: "Proses verifikasi dilakukan manual oleh panitia pada hari kerja. Mohon menunggu 1-3 hari kerja setelah upload dokumen."
        },
        {
            q: "Bagaimana jika ada kesalahan data setelah simpan permanen?",
            a: "Silakan hubungi admin panitia melalui tombol WhatsApp di bawah ini untuk mengajukan perbaikan data."
        }
    ];

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
            <div className="text-center space-y-2 mb-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Pusat Bantuan
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
                    Temukan jawaban atas pertanyaan umum atau hubungi panitia jika Anda mengalami kendala teknis.
                </p>
            </div>

            {/* Admin Contact Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                            <span className="material-symbols-outlined text-[32px]">support_agent</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Butuh Bantuan Langsung?</h3>
                            <p className="text-emerald-50 text-sm">Tim panitia siap membantu Anda via WhatsApp.</p>
                        </div>
                    </div>
                    <Link
                        href="https://wa.me/6281234567890" // Replace with actual number from settings if available, currently hardcoded
                        target="_blank"
                        className="px-6 py-2.5 bg-white text-emerald-700 font-bold rounded-xl shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">chat</span>
                        Chat Admin
                    </Link>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">live_help</span>
                    Pertanyaan Umum (FAQ)
                </h2>
                <div className="grid gap-3">
                    {faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm transition-all hover:border-primary/30">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-sm md:text-base">
                                {faq.q}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
