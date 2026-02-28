
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const waves = await prisma.wave.findMany({
        orderBy: { startDate: 'asc' }
    })

    console.log('--- ALL WAVES (DEBUG) ---')
    waves.forEach(w => {
        console.log(`- ${w.name}`)
        console.log(`  ID: ${w.id}`)
        console.log(`  Start: ${w.startDate.toISOString()}`)
        console.log(`  End: ${w.endDate.toISOString()}`)
        console.log(`  Active: ${w.isActive}`)
        console.log(`  Jalur Allowed: ${JSON.stringify(w.jalurAllowed)}`)
        console.log('---')
    })

    // Also check students and their waveIds
    const students = await prisma.student.findMany({
        select: { id: true, namaLengkap: true, waveId: true, statusKelulusan: true }
    })
    console.log('--- STUDENTS (DEBUG) ---')
    students.forEach(s => {
        console.log(`- ${s.namaLengkap} (ID: ${s.id}, WaveID: ${s.waveId}, Status: ${s.statusKelulusan})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
