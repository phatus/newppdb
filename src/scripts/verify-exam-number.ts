import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
    console.log("Creating a test user and student...");

    // Create a dummy user
    const dummyUser = await db.user.create({
        data: {
            name: "Test User PPDB",
            email: "test.user.ppdb@example.com",
            role: "USER"
        }
    });

    // Create a dummy student
    const dummyStudent = await db.student.create({
        data: {
            userId: dummyUser.id,
            namaLengkap: "Budi Santoso Test",
            nisn: "9876543210",
            statusVerifikasi: "PENDING",
            jalur: "REGULER"
        }
    });

    console.log("Created student with ID:", dummyStudent.id);
    console.log("Student status before verification:", dummyStudent.statusVerifikasi);
    console.log("Student exam number before verification:", dummyStudent.nomorUjian);

    console.log("\nSimulating Verification Process...");

    // Simulating the inner logic directly for testing the random generation
    const yearPrefix = new Date().getFullYear().toString().slice(-2);
    let isUnique = false;
    let finalNumber = "";
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    while (!isUnique) {
        let randomPart = "";
        for (let i = 0; i < 5; i++) {
            randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        finalNumber = `${yearPrefix}-${randomPart}`;

        const existing = await db.student.findFirst({
            where: { nomorUjian: finalNumber },
            select: { id: true }
        });

        if (!existing) {
            isUnique = true;
        }
    }

    const passChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let pass = "";
    for (let i = 0; i < 6; i++) {
        pass += passChars.charAt(Math.floor(Math.random() * passChars.length));
    }

    // Update the student directly
    const updatedStudent = await db.student.update({
        where: { id: dummyStudent.id },
        data: {
            statusVerifikasi: "VERIFIED",
            nomorUjian: finalNumber,
            passwordCbt: pass
        }
    });

    console.log("\nStudent after Verification Simulation:");
    console.log("Nomor Ujian:", updatedStudent.nomorUjian);
    console.log("Password CBT:", updatedStudent.passwordCbt);

    // Check format
    const formatRegex = /^\d{2}-[A-Z0-9]{5}$/;
    if (formatRegex.test(updatedStudent.nomorUjian || "")) {
        console.log("✓ Format Nomor Ujian Matches [Tahun]-[5 Karakter]!");
    } else {
        console.log("X Format Mismatch!");
    }

    // Clean up
    console.log("\nCleaning up test data...");
    await db.student.delete({ where: { id: dummyStudent.id } });
    await db.user.delete({ where: { id: dummyUser.id } });
    console.log("Cleaned up.");
}

main()
    .catch(console.error)
    .finally(() => process.exit(0));
