import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Aiila",
        price: 4.5,
        image: "https://via.placeholder.com/150",
      },
      {
        name: "Green Tea",
        price: 2.5,
        image: "https://via.placeholder.com/150",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
