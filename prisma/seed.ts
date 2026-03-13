import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hashPassword("123456");
  const tenant = await prisma.tenant.upsert({
    where: { slug: "minha-loja" },
    update: {},
    create: {
      name: "Minha Loja",
      slug: "minha-loja",
    },
  });
  await prisma.user.upsert({
    where: { email: "teste@email.com" },
    update: { password: passwordHash },
    create: {
      email: "teste@email.com",
      name: "Usuário Teste",
      password: passwordHash,
      tenantId: tenant.id,
    },
  });
  const store = await prisma.store.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "loja-teste" },
    },
    update: {},
    create: {
      name: "Loja Teste",
      slug: "loja-teste",
      tenantId: tenant.id,
    },
  });
  const category = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "eletronicos" },
    },
    update: {},
    create: {
      name: "Eletrônicos",
      slug: "eletronicos",
      tenantId: tenant.id,
    },
  });
  await prisma.product.upsert({
    where: {
      tenantId_storeId_slug: {
        tenantId: tenant.id,
        storeId: store.id,
        slug: "notebook",
      },
    },
    update: {},
    create: {
      name: "Notebook",
      slug: "notebook",
      price: 2999.99,
      tenantId: tenant.id,
      storeId: store.id,
      categoryId: category.id,
    },
  });
  console.log("Seed OK. Use: email=teste@email.com senha=123456");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
