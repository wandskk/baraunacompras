import { NextResponse } from "next/server";
import { OrderController } from "@/modules/order/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const orderParam = searchParams.get("order");
    const order =
      orderParam === "asc" || orderParam === "desc" ? orderParam : undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "10", 10))
    );
    const q = searchParams.get("q")?.trim() || undefined;
    const controller = new OrderController();
    const result = await controller.listByStore(storeId, tenantId, {
      status,
      order,
      page,
      limit,
      q,
    });
    return NextResponse.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const body = await request.json();
    const controller = new OrderController();
    const order = await controller.create({
      ...body,
      tenantId,
      storeId,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
