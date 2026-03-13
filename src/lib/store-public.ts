import { prisma } from "@/database/prisma";

export async function getPublicStore(tenantSlug: string, storeSlug?: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
  });
  if (!tenant) return null;
  const store = storeSlug
    ? await prisma.store.findFirst({
        where: { slug: storeSlug, tenantId: tenant.id },
      })
    : await prisma.store.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { createdAt: "asc" },
      });
  if (!store) return null;
  return { store, tenantId: tenant.id };
}

export async function getPublicStoreWithProducts(tenantSlug: string, storeSlug?: string) {
  const data = await getPublicStore(tenantSlug, storeSlug);
  if (!data) return null;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { storeId: data.store.id, tenantId: data.tenantId },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: { tenantId: data.tenantId },
    }),
  ]);
  return { store: data.store, products, categories };
}

export async function getPublicProduct(
  tenantSlug: string,
  productSlug: string,
  storeSlug?: string
) {
  const data = await getPublicStore(tenantSlug, storeSlug);
  if (!data) return null;
  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      storeId: data.store.id,
      tenantId: data.tenantId,
    },
    include: { category: true },
  });
  return product;
}
