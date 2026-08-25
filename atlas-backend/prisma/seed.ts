import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'admin@atlas.ddtech.com';
  const password = 'rahasia_negara_123';
  const saltOrRounds = 10;
  const password_hash = await bcrypt.hash(password, saltOrRounds);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password_hash,
      role: 'Super Admin',
      name: 'Administrator'
    },
    create: {
      email,
      name: 'Administrator',
      role: 'Super Admin',
      password_hash,
    },
  });

  console.log('Seeding finished.');
  console.log('Admin account created:');
  console.log(`Email: ${admin.email}`);
  console.log(`Password: ${password}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
