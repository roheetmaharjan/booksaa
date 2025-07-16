
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      name: 'VENDOR',
      name: 'CUSTOMER'
    },
  });
  const hashedPassword = await bcrypt.hash('supersecret', 10);
  await prisma.users.create({
    data: {
      email: 'superadmin@gmail.com',
      firstname: 'Rohit',
      lastname: 'Maharjan',
      password: hashedPassword,
      role: {
        connect: { id: adminRole.id },
      },
      status: "ACTIVE"
    },
  });
  console.log('Super admin created!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());