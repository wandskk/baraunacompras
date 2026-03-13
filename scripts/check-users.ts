import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, tenantId: true },
  });
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, slug: true },
  });
  console.log("Tenants:", JSON.stringify(tenants, null, 2));
  console.log("Users:", JSON.stringify(users, null, 2));
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
