/**
 * Script para forçar atualização de imagens em todos os produtos do seed.
 * Execute: npx tsx scripts/update-product-images.ts  ou  npm run db:update-images
 *
 * Usa placehold.co - CDN confiável com placeholder por produto.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IMG = (text: string) =>
  `https://placehold.co/400x300/2F8743/white?text=${encodeURIComponent(text)}`;

const IMAGE_MAP: { storeSlug: string; productSlug: string; imageUrl: string }[] = [
  { storeSlug: "loja-teste", productSlug: "notebook", imageUrl: IMG("Notebook") },
  { storeSlug: "loja-teste", productSlug: "fone-bluetooth", imageUrl: IMG("Fone Bluetooth") },
  { storeSlug: "loja-teste", productSlug: "carregador-celular", imageUrl: IMG("Carregador") },
  { storeSlug: "mercearia-do-joao", productSlug: "arroz-5kg", imageUrl: IMG("Arroz") },
  { storeSlug: "mercearia-do-joao", productSlug: "feijao-1kg", imageUrl: IMG("Feijão") },
  { storeSlug: "mercearia-do-joao", productSlug: "oleo-soja-900ml", imageUrl: IMG("Óleo") },
  { storeSlug: "mercearia-do-joao", productSlug: "cafe-torrado-500g", imageUrl: IMG("Café") },
  { storeSlug: "farmacia-central", productSlug: "sabonete-liquido", imageUrl: IMG("Sabonete") },
  { storeSlug: "farmacia-central", productSlug: "shampoo-anticaspa", imageUrl: IMG("Shampoo") },
  { storeSlug: "farmacia-central", productSlug: "paracetamol-500mg", imageUrl: IMG("Paracetamol") },
  { storeSlug: "padaria-pao-quente", productSlug: "pao-frances-1kg", imageUrl: IMG("Pão") },
  { storeSlug: "padaria-pao-quente", productSlug: "bolo-chocolate-fatia", imageUrl: IMG("Bolo") },
  { storeSlug: "acai-cia", productSlug: "acai-500ml", imageUrl: IMG("Açaí") },
  { storeSlug: "acai-cia", productSlug: "tapioca-doce", imageUrl: IMG("Tapioca") },
  { storeSlug: "bebidas-barauna", productSlug: "refrigerante-2l", imageUrl: IMG("Refrigerante") },
  { storeSlug: "bebidas-barauna", productSlug: "cerveja-pack-6", imageUrl: IMG("Cerveja") },
  { storeSlug: "moda-estilo", productSlug: "camiseta-basica", imageUrl: IMG("Camiseta") },
  { storeSlug: "moda-estilo", productSlug: "chinelo-havaianas", imageUrl: IMG("Chinelo") },
  { storeSlug: "material-construcao", productSlug: "tinta-latex-18l", imageUrl: IMG("Tinta") },
  { storeSlug: "material-construcao", productSlug: "cimento-50kg", imageUrl: IMG("Cimento") },
];

async function main() {
  let updated = 0;
  for (const { storeSlug, productSlug, imageUrl } of IMAGE_MAP) {
    const store = await prisma.store.findUnique({ where: { slug: storeSlug } });
    if (!store) continue;

    const result = await prisma.product.updateMany({
      where: { storeId: store.id, slug: productSlug },
      data: { imageUrl },
    });
    if (result.count > 0) {
      updated += result.count;
      console.log(`✓ ${storeSlug}/${productSlug}`);
    }
  }
  console.log(`\n${updated} produtos atualizados com imagem.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
