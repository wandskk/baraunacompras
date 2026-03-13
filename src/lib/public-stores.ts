import { prisma } from "@/database/prisma";

export type PublicStoreItem = {
  tenantSlug: string;
  tenantName: string;
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
  };
};

export async function getPublicStores(): Promise<PublicStoreItem[]> {
  try {
    const stores = await prisma.store.findMany({
      take: 24,
      orderBy: { createdAt: "desc" },
      include: {
        tenant: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    });

    return stores.map((s) => ({
      tenantSlug: s.tenant.slug,
      tenantName: s.tenant.name,
      store: {
        id: s.id,
        name: s.name,
        slug: s.slug,
        logoUrl: s.logoUrl,
        description: s.description,
      },
    }));
  } catch {
    return [];
  }
}
