"use client";

import { useRouter, usePathname } from "next/navigation";

interface StudentSelectorProps {
    students: {
        id: string;
        namaLengkap: string;
        nisn: string;
    }[];
    currentStudentId?: string;
}

export default function StudentSelector({ students, currentStudentId }: StudentSelectorProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const studentId = e.target.value;
        if (studentId === "all") {
            router.push(pathname);
        } else {
            router.push(`${pathname}?studentId=${studentId}`);
        }
    };

    if (students.length <= 1) return null;

    return (
        <div className="mb-6">
            <label htmlFor="student-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Pilih Murid
            </label>
            <div className="relative">
                <select
                    id="student-select"
                    value={currentStudentId || "all"}
                    onChange={handleChange}
                    className="appearance-none w-full bg-white dark:bg-[#1A2632] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg py-2.5 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-primary"
                >
                    <option value="all">Semua Murid (Kolektif)</option>
                    {students.map((student) => (
                        <option key={student.id} value={student.id}>
                            {student.namaLengkap} ({student.nisn})
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700 dark:text-slate-400">
                    <span className="material-symbols-outlined text-xl">expand_more</span>
                </div>
            </div>
        </div>
    );
}
