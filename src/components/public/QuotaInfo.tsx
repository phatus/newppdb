"use client";

import { useEffect, useState } from "react";
import { getQuotaStats } from "@/app/actions/public";

interface QuotaStat {
    label: string;
    quota: number;
    filled: number;
    color: string;
}

export default function QuotaInfo() {
    const [stats, setStats] = useState<QuotaStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getQuotaStats().then(res => {
            if (res.success) {
                setStats(res.data);
            }
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="w-full max-w-5xl mx-auto p-6 flex justify-center py-12">
                <span className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Kuota Penerimaan</h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Informasi kuota dan jumlah pendaftar yang telah dinyatakan lulus seleksi untuk tahun pelajaran ini.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, idx) => {
                    const percentage = stat.quota > 0 ? Math.min((stat.filled / stat.quota) * 100, 100) : 0;

                    // Dynamic colors
                    const colorClasses = {
                        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 bar-blue",
                        amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 bar-amber",
                        emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 bar-emerald"
                    };

                    const barColor = {
                        blue: "bg-blue-500",
                        amber: "bg-amber-500",
                        emerald: "bg-emerald-500"
                    }[stat.color] || "bg-primary";

                    const cardClass = colorClasses[stat.color as keyof typeof colorClasses] || colorClasses.blue;


                    return (
                        <div key={idx} className={`rounded-2xl p-6 border shadow-sm backdrop-blur-sm ${cardClass}`}>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className={`w-2 h-6 rounded-full ${barColor}`}></span>
                                {stat.label}
                            </h3>

                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <span className="text-4xl font-black">{stat.filled}</span>
                                    <span className="text-sm opacity-70 font-medium ml-1">Terisi</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold opacity-80">{stat.quota}</span>
                                    <span className="text-xs opacity-60 block">Kuota</span>
                                </div>
                            </div>

                            <div className="w-full h-3 bg-white/50 dark:bg-black/20 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs mt-2 opacity-70 text-right font-medium">
                                {percentage.toFixed(1)}% Terpenuhi
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
