
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("Seeding database...");

    // 1. Seed Semesters
    const semesters = [
        { name: "Kelas 5 Semester 1", order: 1 },
        { name: "Kelas 5 Semester 2", order: 2 },
        { name: "Kelas 6 Semester 1", order: 3 },
        { name: "Kelas 6 Semester 2", order: 4 },
    ];

    for (const sem of semesters) {
        await db.semester.create({
            data: {
                name: sem.name,
                order: sem.order,
                isActive: true,
            }
        });
    }
    console.log("Semesters seeded.");

    // 2. Seed Subjects
    const subjects = [
        // UMUM
        { name: "Bahasa Indonesia", category: "UMUM", order: 1 },
        { name: "Bahasa Inggris", category: "UMUM", order: 2 },
        { name: "Matematika", category: "UMUM", order: 3 },
        { name: "Ilmu Pengetahuan Alam (IPA)", category: "UMUM", order: 4 },

        // AGAMA (SD)
        { name: "Pendidikan Agama", category: "AGAMA", order: 5 },

        // AGAMA (MI)
        { name: "Akidah Akhlak", category: "AGAMA", order: 6 },
        { name: "Fikih", category: "AGAMA", order: 7 },
        { name: "Sejarah Kebudayaan Islam (SKI)", category: "AGAMA", order: 8 },
        { name: "Al-Quran Hadist", category: "AGAMA", order: 9 },
    ];

    for (const sub of subjects) {
        await db.subject.create({
            data: {
                name: sub.name,
                category: sub.category,
                order: sub.order,
                isActive: true,
            }
        });
    }
    console.log("Subjects seeded.");

    // 3. Seed Achievement Weights
    const achievements = [
        { category: "Akademik", level: "Nasional", rank: 1, points: 100 },
        { category: "Akademik", level: "Nasional", rank: 2, points: 75 },
        { category: "Akademik", level: "Nasional", rank: 3, points: 50 },
        { category: "Akademik", level: "Provinsi", rank: 1, points: 50 },
        { category: "Akademik", level: "Provinsi", rank: 2, points: 30 },
        { category: "Akademik", level: "Provinsi", rank: 3, points: 20 },

        { category: "Non-Akademik", level: "Nasional", rank: 1, points: 75 },
        { category: "Non-Akademik", level: "Nasional", rank: 2, points: 50 },
        { category: "Non-Akademik", level: "Nasional", rank: 3, points: 25 },
        // Add more as needed
    ];

    for (const ach of achievements) {
        await db.achievementWeight.create({
            data: {
                category: ach.category,
                level: ach.level,
                rank: ach.rank,
                points: ach.points,
            }
        });
    }
    console.log("Achievement Weights seeded.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
