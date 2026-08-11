import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Starting database seed...');

  const roles = [
    {
      name: 'SUPER_ADMIN',
      description: 'Platform administrator',
    },
    {
      name: 'CAFE_OWNER',
      description: 'Restaurant owner',
    },
    {
      name: 'EXECUTIVE',
      description: 'Manages assigned branches',
    },
    {
      name: 'BRANCH_MANAGER',
      description: 'Manages a restaurant branch',
    },
    {
      name: 'STAFF',
      description: 'Restaurant staff member',
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: {
        name: role.name,
      },
      update: {
        description: role.description,
      },
      create: role,
    });
  }

  console.log('✅ Roles seeded successfully');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });