"use client";

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#ef4444', '#8b5cf6'];
const STATUS_COLORS: any = {
    'VERIFIED': '#10b981', // Emerald
    'PENDING': '#f59e0b', // Amber
    'REJECTED': '#ef4444'  // Red
};

interface AnalyticsData {
    daily: { date: string; count: number }[];
    jalur: { name: string; value: number }[];
    status: { name: string; value: number }[];
    gender: { name: string; value: number }[];
}

export default function DashboardCharts({ data }: { data: AnalyticsData }) {
    if (!data) return null;

    // Process Jalur Names for better display
    const processedJalur = data.jalur.map(j => ({
        name: j.name.replace('_', ' '),
        value: j.value
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Daily Registrations */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Pendaftaran 7 Hari Terakhir</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.daily}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                                stroke="#94a3b8"
                            />
                            <YAxis stroke="#94a3b8" allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                            />
                            <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Jalur Distribution */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Distribusi Jalur Pendaftaran</h3>
                <div className="h-[300px] w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={processedJalur}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {processedJalur.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Status Verifikasi</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.status} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={100}
                                tick={{ fontSize: 11, fill: '#64748b' }}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                {data.status.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Jenis Kelamin</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.gender}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.gender.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'L' || entry.name === 'Laki-laki' ? '#3b82f6' : '#ec4899'} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
