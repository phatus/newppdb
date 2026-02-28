
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({
        where: {
            namaLengkap: {
                contains: 'agus widiyanto',
                mode: 'insensitive'
            }
        },
        include: {
            documents: true
        }
    });

    console.log('Student Info:', JSON.stringify(student, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
