import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/hash";

const prisma = new PrismaClient();

const storesToSeed = [
  {
    name: "Loja Teste",
    slug: "loja-teste",
    description: "Loja de eletrônicos e equipamentos.",
  },
  {
    name: "Mercearia do João",
    slug: "mercearia-do-joao",
    description: "Mercado com alimentos, bebidas e produtos de limpeza.",
  },
  {
    name: "Farmácia Central",
    slug: "farmacia-central",
    description: "Farmácia com medicamentos e produtos de higiene.",
  },
  {
    name: "Padaria Pão Quente",
    slug: "padaria-pao-quente",
    description: "Padaria e confeitaria com pães frescos diariamente.",
  },
  {
    name: "Açaí & Cia",
    slug: "acai-cia",
    description: "Açaí, tapioca e lanches naturais.",
  },
  {
    name: "Bebidas Baraúna",
    slug: "bebidas-barauna",
    description: "Bebidas, refrigerantes e cervejas.",
  },
  {
    name: "Moda e Estilo",
    slug: "moda-estilo",
    description: "Roupas, calçados e acessórios.",
  },
  {
    name: "Material de Construção",
    slug: "material-construcao",
    description: "Ferragens, tintas e materiais para obra.",
  },
];

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

  for (const storeData of storesToSeed) {
    await prisma.store.upsert({
      where: {
        tenantId_slug: { tenantId: tenant.id, slug: storeData.slug },
      },
      update: {
        name: storeData.name,
        description: storeData.description,
      },
      create: {
        name: storeData.name,
        slug: storeData.slug,
        description: storeData.description,
        theme: "default",
        tenantId: tenant.id,
      },
    });
  }

  // Manter categorias e produto da loja original
  const storeTeste = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "loja-teste" },
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
        storeId: storeTeste.id,
        slug: "notebook",
      },
    },
    update: {},
    create: {
      name: "Notebook",
      slug: "notebook",
      price: 2999.99,
      tenantId: tenant.id,
      storeId: storeTeste.id,
      categoryId: category.id,
    },
  });

  console.log("Seed OK. Use: email=teste@email.com senha=123456");
  console.log(`Criadas ${storesToSeed.length} lojas para o usuário teste.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
