
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("Setting up registration waves and quotas...");

    // 1. Update School Settings
    const settings = await db.schoolSettings.findFirst();
    if (settings) {
        await db.$executeRawUnsafe(`
            UPDATE "SchoolSettings" 
            SET "studentsPerClass" = 32
            WHERE "id" = $1
        `, settings.id);
        console.log("School settings updated: 32 students/class, max 4 classes for Wave 1.");
    }

    // 2. Clear existing waves to start fresh (Optional, but safer for this setup)
    // await db.wave.deleteMany({});

    // 3. Create Gelombang 1
    const startDate1 = new Date();
    const endDate1 = new Date();
    endDate1.setMonth(endDate1.getMonth() + 1);

    const wave1 = await db.wave.upsert({
        where: { id: "gelombang-1" },
        update: {
            name: "Gelombang 1",
            description: "Penerimaan Tahap 1 (4 Kelas)",
            startDate: startDate1,
            endDate: endDate1,
            isActive: true,
            quota: 128, // 4 * 32
            pathQuotas: {
                "REGULER": 64,
                "PRESTASI_AKADEMIK": 32,
                "PRESTASI_NON_AKADEMIK": 32
            },
            jalurAllowed: ["REGULER", "PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK"]
        },
        create: {
            id: "gelombang-1",
            name: "Gelombang 1",
            description: "Penerimaan Tahap 1 (4 Kelas)",
            startDate: startDate1,
            endDate: endDate1,
            isActive: true,
            quota: 128,
            pathQuotas: {
                "REGULER": 64,
                "PRESTASI_AKADEMIK": 32,
                "PRESTASI_NON_AKADEMIK": 32
            },
            jalurAllowed: ["REGULER", "PRESTASI_AKADEMIK", "PRESTASI_NON_AKADEMIK"]
        }
    });
    console.log("Wave 1 created/updated:", wave1.name);

    // 4. Create Gelombang 2
    const startDate2 = new Date(endDate1);
    startDate2.setDate(startDate2.getDate() + 1);
    const endDate2 = new Date(startDate2);
    endDate2.setMonth(endDate2.getMonth() + 1);

    const wave2 = await db.wave.upsert({
        where: { id: "gelombang-2" },
        update: {
            name: "Gelombang 2",
            description: "Penerimaan Tahap 2 (Sisa Kuota)",
            startDate: startDate2,
            endDate: endDate2,
            isActive: false, // Not active yet
            quota: 128, // Assuming another 4 classes or total 8 classes
            pathQuotas: {
                "REGULER": 100,
                "AFIRMASI": 28
            },
            jalurAllowed: ["REGULER", "AFIRMASI"]
        },
        create: {
            id: "gelombang-2",
            name: "Gelombang 2",
            description: "Penerimaan Tahap 2 (Sisa Kuota)",
            startDate: startDate2,
            endDate: endDate2,
            isActive: false,
            quota: 128,
            pathQuotas: {
                "REGULER": 100,
                "AFIRMASI": 28
            },
            jalurAllowed: ["REGULER", "AFIRMASI"]
        }
    });
    console.log("Wave 2 created/updated:", wave2.name);

    console.log("Setup completed successfully!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
