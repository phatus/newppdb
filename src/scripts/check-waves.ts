
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const waves = await prisma.wave.findMany({
        orderBy: { startDate: 'asc' }
    })

    console.log('--- ALL WAVES ---')
    waves.forEach(w => {
        console.log(`- ${w.name} (ID: ${w.id}, Start: ${w.startDate.toISOString()}, End: ${w.endDate.toISOString()}, Active: ${w.isActive})`)
    })
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
