
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

async function main() {
  const roles = ['ADMIN', 'VENDOR', 'CUSTOMER'];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }
   const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (!adminRole) {
    throw new Error('ADMIN role not found');
  }

  
  const hashedPassword = await bcrypt.hash('supersecret', 10);
  await prisma.users.create({
    data: {
      email: 'superadmin@gmail.com',
      firstname: 'Rohit',
      lastname: 'Maharjan',
      password: hashedPassword,
      roleId: adminRole.id,
      status: "ACTIVE"
    },
  });
  console.log('Super admin created!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());