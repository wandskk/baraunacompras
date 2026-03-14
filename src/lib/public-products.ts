import { prisma } from "@/database/prisma";
import { getEffectivePrice, isProductOnPromotion } from "./product-price";

export type PublicProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  originalPrice?: string | null;
  isPromotion: boolean;
  storeName: string;
  tenantSlug: string;
  storeSlug: string;
};

export type PublicProductsResult = {
  products: PublicProductItem[];
  pagination: { page: number; limit: number; total: number };
};

export async function getPublicProducts(
  q?: string,
  page = 1,
  limit = 10,
): Promise<PublicProductsResult> {
  try {
    const where = q?.trim()
      ? {
          AND: [
            { stock: { gt: 0 } },
            {
              OR: [
                { name: { contains: q.trim(), mode: "insensitive" as const } },
                {
                  description: {
                    contains: q.trim(),
                    mode: "insensitive" as const,
                  },
                },
              ],
            },
          ],
        }
      : { stock: { gt: 0 } };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          store: {
            include: {
              tenant: {
                select: { slug: true },
              },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => {
        const onPromo = isProductOnPromotion(p);
        const effectivePrice = getEffectivePrice(p);
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          imageUrl: p.imageUrl,
          price: String(effectivePrice),
          originalPrice: onPromo ? p.price.toString() : null,
          isPromotion: onPromo,
          storeName: p.store.name,
          tenantSlug: p.store.tenant.slug,
          storeSlug: p.store.slug,
        };
      }),
      pagination: { page, limit, total },
    };
  } catch {
    return {
      products: [],
      pagination: { page: 1, limit, total: 0 },
    };
  }
}
