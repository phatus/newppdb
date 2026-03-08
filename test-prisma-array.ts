import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        // Find how many required semesters exist 
        const activeSemesters = await prisma.semester.findMany({
            where: { isActive: true, NOT: { name: { contains: "Kelas 6 Semester 2" } } }
        });
        const requiredSemesterCount = activeSemesters.length || 5;

        // Try Prisma relation count filtering if possible
        const docs = await prisma.student.findMany({
            where: {
                grades: {
                    // is this valid Prisma?
                    isNot: null,
                    // some say you can't use count here directly
                }
            },
            take: 1,
            include: {
                _count: {
                    select: {
                        history: true
                    }
                }
            }
        });

        console.log("Docs found:", docs.length)

    } catch (err: any) {
        console.error("Error:", err.message)
    }
}

main().then(() => prisma.$disconnect()).catch(() => prisma.$disconnect())
