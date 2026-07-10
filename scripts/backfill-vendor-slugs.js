import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const vendors = await prisma.vendors.findMany({
    select: { id: true, name: true, slug: true },
  });

  let updated = 0;

  for (const vendor of vendors) {
    const nextSlug = slugify(vendor.name);
    if (!vendor.slug && nextSlug) {
      await prisma.vendors.update({
        where: { id: vendor.id },
        data: { slug: nextSlug },
      });
      updated += 1;
    }
  }

  console.log(JSON.stringify({ checked: vendors.length, updated }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
