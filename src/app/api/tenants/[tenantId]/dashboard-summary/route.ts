import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/database/prisma";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantIdParamSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    tenantIdParamSchema.parse(rawParams);
    const { tenantId } = rawParams;

    const stores = await prisma.store.findMany({
      where: { tenantId },
      include: { tenant: { select: { slug: true } } },
    });

    if (stores.length === 0) {
      return NextResponse.json({ stores: [], statsByStore: {} });
    }

    const storeIds = stores.map((s) => s.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingByStore, revenueByStore, lowStockByStore] = await Promise.all([
      prisma.order.groupBy({
        by: ["storeId"],
        where: {
          storeId: { in: storeIds },
          tenantId,
          status: "pending",
        },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ["storeId"],
        where: {
          storeId: { in: storeIds },
          tenantId,
          status: "delivered",
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.$queryRaw<
        { storeId: string; count: bigint }[]
      >`
        SELECT "storeId", COUNT(*) as count FROM "Product"
        WHERE "storeId" IN (${Prisma.join(storeIds.map((id) => Prisma.sql`${id}`))})
        AND "tenantId" = ${tenantId}
        AND "minStock" > 0 AND stock < "minStock"
        GROUP BY "storeId"
      `,
    ]);

    const statsByStore: Record<
      string,
      { pendingOrders: number; revenueThisMonth: number; lowStockCount: number }
    > = {};
    for (const s of stores) {
      statsByStore[s.id] = {
        pendingOrders:
          pendingByStore.find((p) => p.storeId === s.id)?._count.id ?? 0,
        revenueThisMonth:
          Number(
            revenueByStore.find((r) => r.storeId === s.id)?._sum.total ?? 0
          ),
        lowStockCount:
          Number(
            lowStockByStore.find((l) => l.storeId === s.id)?.count ?? 0
          ),
      };
    }

    return NextResponse.json({
      stores: stores.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        theme: s.theme,
        tenantId: s.tenantId,
        tenant: s.tenant,
      })),
      statsByStore,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
