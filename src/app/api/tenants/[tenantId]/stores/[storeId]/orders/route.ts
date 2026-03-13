import { NextResponse } from "next/server";
import { OrderController } from "@/modules/order/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const controller = new OrderController();
    const orders = await controller.listByStore(storeId, tenantId);
    return NextResponse.json(orders);
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
