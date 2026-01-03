const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Connecting to database...");
        await prisma.$connect();
        console.log("✅ Database connection successful!");

        // Check timeout manually if needed, but connect usually throws
        const userCount = await prisma.user.count();
        console.log(`Current user count: ${userCount}`);

    } catch (error) {
        console.error("❌ Database connection failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
