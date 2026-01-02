import { getSubjects } from "@/app/actions/subjects";
import SubjectList from "@/components/admin/SubjectList";

export const metadata = {
    title: "Pengaturan Mata Pelajaran | Admin PPDB",
    description: "Kelola daftar mata pelajaran untuk input nilai raport.",
};

export default async function SubjectsPage() {
    const { data: subjects } = await getSubjects();

    return (
        <div className="p-6 w-full max-w-[1200px] mx-auto flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Pengaturan Mata Pelajaran
                    </h1>
                    <p className="text-slate-500 text-sm">
                        Kelola daftar mata pelajaran yang aktif untuk input nilai raport.
                    </p>
                </div>
            </div>

            <SubjectList initialSubjects={subjects || []} />
        </div>
    );
}
