import { prisma } from "@/database/prisma";

export type PublicProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  storeName: string;
  tenantSlug: string;
};

export async function getPublicProducts(q?: string): Promise<PublicProductItem[]> {
  try {
    const where = q?.trim()
      ? {
          OR: [
            { name: { contains: q.trim(), mode: "insensitive" as const } },
            {
              description: {
                contains: q.trim(),
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const products = await prisma.product.findMany({
      where,
      take: 24,
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
    });

    return products
      .filter((p) => p.stock > 0)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        imageUrl: p.imageUrl,
        price: p.price.toString(),
        storeName: p.store.name,
        tenantSlug: p.store.tenant.slug,
      }));
  } catch {
    return [];
  }
}
