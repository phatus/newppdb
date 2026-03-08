import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const latestWave = await prisma.wave.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!latestWave) {
        console.log("No wave found.");
        return;
    }

    const user = await prisma.user.findFirst({
        where: { role: 'USER' }
    });

    if (!user) {
        console.log("No user found.");
        return;
    }

    console.log("Creating an incomplete student...");
    const student = await prisma.student.create({
        data: {
            namaLengkap: "Test Incomplete Student",
            nisn: "TEST999888",
            userId: user.id,
            waveId: latestWave.id,
            jalur: "REGULER",
        }
    });

    console.log("Created incomplete student:", student.id);
    console.log("Please check Admin verification panel for 'Data Belum Lengkap' label.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
