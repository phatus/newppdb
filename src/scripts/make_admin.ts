import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = 'trezeq@gmail.com'
    const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    })
    console.log(`Updated ${user.email} to ${user.role}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
