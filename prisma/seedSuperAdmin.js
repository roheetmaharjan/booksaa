import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('supersecret', 10);
  await prisma.user.create({
    data: {
      email: 'superadmin@gmail.com',
      firstname: 'Rohit',
      lastname: 'Maharjan',
      password: hashedPassword,
      role : "ADMIN",
      status: "ACTIVE"
    },
  });
  console.log('Super admin created!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());