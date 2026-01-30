
import { getAnnouncements } from "@/app/actions/announcements";

export default async function UserAnnouncementsPage() {
    const announcements = await getAnnouncements(false); // Fetch only active announcements

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Papan Pengumuman
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Informasi terbaru seputar pelaksanaan SPMB.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {announcements.length === 0 ? (
                    <div className="p-10 text-center bg-white dark:bg-[#1e293b] rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <span className="material-symbols-outlined text-3xl">campaign</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Belum ada pengumuman</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Silakan cek kembali nanti untuk informasi terbaru.
                        </p>
                    </div>
                ) : (
                    announcements.map((item) => (
                        <div
                            key={item.id}
                            className={`p-5 rounded-xl border bg-white dark:bg-[#1e293b] shadow-sm animate-in fade-in slide-in-from-bottom-2 ${item.type === 'IMPORTANT' ? 'border-l-4 border-l-red-500 border-red-100 dark:border-red-900/30' :
                                item.type === 'WARNING' ? 'border-l-4 border-l-amber-500 border-amber-100 dark:border-amber-900/30' :
                                    'border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-700'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2.5 rounded-full shrink-0 ${item.type === 'IMPORTANT' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                                    item.type === 'WARNING' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
                                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                    }`}>
                                    <span className="material-symbols-outlined text-[24px]">
                                        {item.type === 'IMPORTANT' ? 'campaign' : item.type === 'WARNING' ? 'warning' : 'info'}
                                    </span>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                            {item.title}
                                        </h3>
                                        <span className="text-xs font-medium text-slate-400 whitespace-nowrap pt-1">
                                            {new Date(item.createdAt).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                        {item.content}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
