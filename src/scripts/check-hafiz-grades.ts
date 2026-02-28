
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const allStudents = await prisma.student.findMany({
        select: { id: true, namaLengkap: true, jalur: true, statusVerifikasi: true }
    })

    console.log('--- ALL STUDENTS IN DB ---')
    allStudents.forEach(s => {
        console.log(`- ${s.namaLengkap} (ID: ${s.id}, Jalur: ${s.jalur}, Status: ${s.statusVerifikasi})`)
    })

    const targetName = 'ahmad hafiz'
    const student = allStudents.find(s => s.namaLengkap.toLowerCase().includes(targetName.toLowerCase()))

    if (student) {
        console.log('\n--- TARGET STUDENT FOUND ---')
        const detailedStudent = await prisma.student.findUnique({
            where: { id: student.id },
            include: {
                grades: {
                    include: {
                        semesterGrades: {
                            include: {
                                semester: true,
                                entries: true
                            }
                        }
                    }
                }
            }
        })

        if (detailedStudent) {
            console.log('Grades Record exists:', !!detailedStudent.grades)
            console.log('Semester Grades Count:', detailedStudent.grades?.semesterGrades?.length || 0)
            detailedStudent.grades?.semesterGrades.forEach(sg => {
                console.log(`  - Semester: ${sg.semester.name}, Entries: ${sg.entries.length}, Rata-rata: ${sg.rataRataSemester}`)
            })

            const activeSemesters = await prisma.semester.findMany({
                where: { isActive: true, NOT: { name: { contains: "Kelas 6 Semester 2" } } }
            })
            console.log('\nActive Semesters required:', activeSemesters.length)
            activeSemesters.forEach(s => console.log(`  - ${s.name}`))
        }
    } else {
        console.log('\nTarget student NOT found in full list.')
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
