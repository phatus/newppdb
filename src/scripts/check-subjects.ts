
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    const subjects = await db.subject.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
    });
    console.log("Active Subjects:", JSON.stringify(subjects, null, 2));
}

main().finally(() => db.$disconnect());
