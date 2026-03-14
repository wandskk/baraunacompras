import { NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;

    const store = await prisma.store.findFirst({
      where: { id: storeId, tenantId },
    });
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pendingOrders, revenueAgg, lowStockRows] = await Promise.all([
      prisma.order.count({
        where: { storeId, tenantId, status: "pending" },
      }),
      prisma.order.aggregate({
        where: {
          storeId,
          tenantId,
          status: "delivered",
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM "Product"
        WHERE "storeId" = ${storeId} AND "tenantId" = ${tenantId}
        AND "minStock" > 0 AND stock < "minStock"
      `,
    ]);
    const lowStockCount = Number(lowStockRows[0]?.count ?? 0);
    const revenueThisMonth = Number(revenueAgg._sum.total ?? 0);

    return NextResponse.json({
      pendingOrders,
      revenueThisMonth,
      lowStockCount,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
