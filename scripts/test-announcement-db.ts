
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Testing DB Connection...");
    try {
        // 1. Try Prisma Client standard call (if generated)
        // Note: Client might not be generated due to EPERM, so this might fail if we rely on it.
        // But let's try raw query primarily since that's what the app uses.

        console.log("Attempting Raw Query: SELECT * FROM \"Announcement\" LIMIT 1");
        const result = await prisma.$queryRawUnsafe('SELECT * FROM "Announcement" LIMIT 1');
        console.log("Success! Result:", result);

        console.log("Attempting to count records...");
        const count = await prisma.$queryRawUnsafe('SELECT COUNT(*) FROM "Announcement"');
        console.log("Count Result:", count);

    } catch (e) {
        console.error("Test Failed!");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
