const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@admin.com';
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date();

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: now,
    },
    create: {
      email,
      name: 'Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: now,
    },
  });

  console.log('✅ Admin user created & verified successfully:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
