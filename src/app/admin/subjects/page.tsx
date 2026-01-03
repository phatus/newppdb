import { getSubjects } from "@/app/actions/subjects";
import { getSemesters } from "@/app/actions/semesters";
import SubjectList from "@/components/admin/SubjectList";
import SemesterManager from "@/components/admin/SemesterManager";

export const metadata = {
    title: "Pengaturan Mata Pelajaran | Admin PPDB",
    description: "Kelola daftar mata pelajaran untuk input nilai raport.",
};

export default async function SubjectsPage() {
    const [{ data: subjects }, { data: semesters }] = await Promise.all([
        getSubjects(),
        getSemesters()
    ]);

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Pengaturan Data Akademik
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola daftar mata pelajaran dan semester untuk input nilai raport.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SemesterManager initialSemesters={semesters || []} />
            </div>

            <SubjectList initialSubjects={subjects || []} />
        </div>
    );
}
