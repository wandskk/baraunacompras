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

    const [pendingOrders, ordersThisMonth, lowStockCount] = await Promise.all([
      prisma.order.count({
        where: { storeId, tenantId, status: "pending" },
      }),
      prisma.order.findMany({
        where: {
          storeId,
          tenantId,
          status: { not: "cancelled" },
          createdAt: { gte: startOfMonth },
        },
        select: { total: true },
      }),
      prisma.product.count({
        where: {
          storeId,
          tenantId,
          OR: [{ stock: 0 }, { stock: { lt: 5 } }],
        },
      }),
    ]);

    const revenueThisMonth = ordersThisMonth.reduce(
      (sum, o) => sum + Number(o.total),
      0
    );

    return NextResponse.json({
      pendingOrders,
      revenueThisMonth,
      lowStockCount,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
