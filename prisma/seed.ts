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

  // Buscar lojas
  const storeTeste = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "loja-teste" },
  });
  const mercearia = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "mercearia-do-joao" },
  });
  const farmacia = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "farmacia-central" },
  });
  const padaria = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "padaria-pao-quente" },
  });
  const acai = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "acai-cia" },
  });
  const bebidas = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "bebidas-barauna" },
  });
  const moda = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "moda-estilo" },
  });
  const material = await prisma.store.findFirstOrThrow({
    where: { tenantId: tenant.id, slug: "material-construcao" },
  });

  // Categorias
  const catEletronicos = await prisma.category.upsert({
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
  const catAlimentos = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "alimentos" },
    },
    update: {},
    create: {
      name: "Alimentos",
      slug: "alimentos",
      tenantId: tenant.id,
    },
  });
  const catHigiene = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "higiene" },
    },
    update: {},
    create: {
      name: "Higiene",
      slug: "higiene",
      tenantId: tenant.id,
    },
  });
  const catPadaria = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "padaria" },
    },
    update: {},
    create: {
      name: "Padaria",
      slug: "padaria",
      tenantId: tenant.id,
    },
  });
  const catLanches = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "lanches" },
    },
    update: {},
    create: {
      name: "Lanches",
      slug: "lanches",
      tenantId: tenant.id,
    },
  });
  const catBebidas = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "bebidas" },
    },
    update: {},
    create: {
      name: "Bebidas",
      slug: "bebidas",
      tenantId: tenant.id,
    },
  });
  const catRoupas = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "roupas" },
    },
    update: {},
    create: {
      name: "Roupas",
      slug: "roupas",
      tenantId: tenant.id,
    },
  });
  const catConstrucao = await prisma.category.upsert({
    where: {
      tenantId_slug: { tenantId: tenant.id, slug: "construcao" },
    },
    update: {},
    create: {
      name: "Construção",
      slug: "construcao",
      tenantId: tenant.id,
    },
  });

  // 20 produtos variados
  const productsToSeed = [
    {
      store: storeTeste,
      category: catEletronicos,
      name: "Notebook",
      slug: "notebook",
      price: 2999.99,
      stock: 5,
      description: "Notebook para trabalho e estudo.",
    },
    {
      store: storeTeste,
      category: catEletronicos,
      name: "Fone de ouvido Bluetooth",
      slug: "fone-bluetooth",
      price: 89.9,
      stock: 15,
      description: "Fone com cancelamento de ruído.",
    },
    {
      store: storeTeste,
      category: catEletronicos,
      name: "Carregador celular rápido",
      slug: "carregador-celular",
      price: 45.0,
      stock: 30,
    },
    {
      store: mercearia,
      category: catAlimentos,
      name: "Arroz tipo 1 5kg",
      slug: "arroz-5kg",
      price: 24.9,
      stock: 50,
      description: "Arroz branco de boa qualidade.",
    },
    {
      store: mercearia,
      category: catAlimentos,
      name: "Feijão carioca 1kg",
      slug: "feijao-1kg",
      price: 8.5,
      stock: 40,
    },
    {
      store: mercearia,
      category: catAlimentos,
      name: "Óleo de soja 900ml",
      slug: "oleo-soja-900ml",
      price: 7.99,
      stock: 60,
    },
    {
      store: mercearia,
      category: catAlimentos,
      name: "Café torrado 500g",
      slug: "cafe-torrado-500g",
      price: 18.9,
      stock: 25,
    },
    {
      store: farmacia,
      category: catHigiene,
      name: "Sabonete líquido 250ml",
      slug: "sabonete-liquido",
      price: 12.9,
      stock: 35,
    },
    {
      store: farmacia,
      category: catHigiene,
      name: "Shampoo anticaspa 400ml",
      slug: "shampoo-anticaspa",
      price: 28.5,
      stock: 20,
    },
    {
      store: farmacia,
      category: catHigiene,
      name: "Paracetamol 500mg 20 comprimidos",
      slug: "paracetamol-500mg",
      price: 8.99,
      stock: 45,
      description: "Analgésico e antitérmico.",
    },
    {
      store: padaria,
      category: catPadaria,
      name: "Pão francês 1kg",
      slug: "pao-frances-1kg",
      price: 12.0,
      stock: 20,
    },
    {
      store: padaria,
      category: catPadaria,
      name: "Bolo de chocolate fatia",
      slug: "bolo-chocolate-fatia",
      price: 6.5,
      stock: 15,
    },
    {
      store: acai,
      category: catLanches,
      name: "Açaí 500ml",
      slug: "acai-500ml",
      price: 15.0,
      stock: 30,
    },
    {
      store: acai,
      category: catLanches,
      name: "Tapioca doce",
      slug: "tapioca-doce",
      price: 10.0,
      stock: 25,
    },
    {
      store: bebidas,
      category: catBebidas,
      name: "Refrigerante 2L",
      slug: "refrigerante-2l",
      price: 9.9,
      stock: 80,
    },
    {
      store: bebidas,
      category: catBebidas,
      name: "Cerveja pack 6 unidades",
      slug: "cerveja-pack-6",
      price: 24.9,
      stock: 40,
    },
    {
      store: moda,
      category: catRoupas,
      name: "Camiseta básica",
      slug: "camiseta-basica",
      price: 39.9,
      stock: 50,
      description: "Camiseta 100% algodão.",
    },
    {
      store: moda,
      category: catRoupas,
      name: "Chinelo Havaianas",
      slug: "chinelo-havaianas",
      price: 49.9,
      stock: 30,
    },
    {
      store: material,
      category: catConstrucao,
      name: "Tinta látex branca 18L",
      slug: "tinta-latex-18l",
      price: 189.0,
      stock: 10,
      description: "Tinta para pintura de paredes.",
    },
    {
      store: material,
      category: catConstrucao,
      name: "Cimento 50kg",
      slug: "cimento-50kg",
      price: 32.9,
      stock: 100,
    },
  ];

  for (const p of productsToSeed) {
    await prisma.product.upsert({
      where: {
        tenantId_storeId_slug: {
          tenantId: tenant.id,
          storeId: p.store.id,
          slug: p.slug,
        },
      },
      update: {
        name: p.name,
        price: p.price,
        stock: p.stock,
        description: p.description ?? null,
        categoryId: p.category.id,
      },
      create: {
        name: p.name,
        slug: p.slug,
        price: p.price,
        stock: p.stock,
        description: p.description ?? null,
        tenantId: tenant.id,
        storeId: p.store.id,
        categoryId: p.category.id,
      },
    });
  }

  console.log("Seed OK. Use: email=teste@email.com senha=123456");
  console.log(`Criadas ${storesToSeed.length} lojas e ${productsToSeed.length} produtos para o usuário teste.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
