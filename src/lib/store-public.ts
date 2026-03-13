import type { Category } from "@prisma/client";
import { prisma } from "@/database/prisma";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: { toString: () => string };
  stock: number;
  variations?: string[];
  sizes?: string[];
  tenantId: string;
  storeId: string;
  categoryId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category: Category | null;
};

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

type ProductFilters = {
  categoryId?: string;
  q?: string;
  page?: number;
  limit?: number;
};

export async function getPublicStoreWithProducts(
  tenantSlug: string,
  storeSlug?: string,
  filters?: ProductFilters,
) {
  const data = await getPublicStore(tenantSlug, storeSlug);
  if (!data) return null;
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? 50;
  const skip = (page - 1) * limit;
  const where: {
    storeId: string;
    tenantId: string;
    categoryId?: string;
    AND?: object[];
  } = {
    storeId: data.store.id,
    tenantId: data.tenantId,
  };
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (filters?.q?.trim()) {
    where.AND = [
      {
        OR: [
          { name: { contains: filters.q!, mode: "insensitive" as const } },
          {
            description: { contains: filters.q!, mode: "insensitive" as const },
          },
        ],
      },
    ];
  }
  const [products, categories, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.category.findMany({
      where: { tenantId: data.tenantId },
    }),
    prisma.product.count({ where }),
  ]);
  return {
    store: data.store,
    products,
    categories,
    pagination: { page, limit, total },
  };
}

export async function getPublicProduct(
  tenantSlug: string,
  productSlug: string,
  storeSlug?: string,
): Promise<PublicProduct | null> {
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
  return product as PublicProduct | null;
}

export function isProductAvailable(product: { stock: number }): boolean {
  return product.stock > 0;
}

export async function getRelatedProducts(
  tenantSlug: string,
  productId: string,
  categoryId: string | null,
  storeSlug?: string,
  limit = 8,
): Promise<PublicProduct[]> {
  const data = await getPublicStore(tenantSlug, storeSlug);
  if (!data) return [];
  const where: {
    storeId: string;
    tenantId: string;
    id: { not: string };
    categoryId?: string | null;
  } = {
    storeId: data.store.id,
    tenantId: data.tenantId,
    id: { not: productId },
  };
  if (categoryId) where.categoryId = categoryId;
  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return products as PublicProduct[];
}
