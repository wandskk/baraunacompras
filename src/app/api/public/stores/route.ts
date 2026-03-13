import { NextResponse } from "next/server";
import { prisma } from "@/database/prisma";

export async function GET() {
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

    const result = stores.map((s) => ({
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

    return NextResponse.json(result);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
