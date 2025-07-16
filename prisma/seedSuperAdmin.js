
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

async function main() {
  const hashedPassword = await bcrypt.hash('supersecret', 10);
  await prisma.users.create({
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