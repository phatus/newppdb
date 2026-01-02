"use client";

interface ChartData {
    date: string;
    count: number;
}

export default function RegistrationChart({ data }: { data: ChartData[] }) {
    const maxCount = Math.max(...data.map((d) => d.count), 5); // Minimum max of 5 for scale

    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 px-4 pb-4 pt-8">
            {data.map((item, index) => {
                const heightPercentage = (item.count / maxCount) * 100;
                return (
                    <div key={index} className="flex flex-col items-center flex-1 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {item.count} Pendaftar
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>

                        {/* Bar */}
                        <div
                            className="w-full max-w-[40px] bg-primary/20 hover:bg-primary transition-all duration-300 rounded-t-md relative overflow-hidden group-hover:shadow-lg"
                            style={{ height: `${heightPercentage}%` }}
                        >
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/50"></div>
                        </div>

                        {/* Label */}
                        <div className="mt-2 text-[10px] sm:text-xs text-slate-500 font-medium text-center rotate-0 truncate w-full">
                            {item.date}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
