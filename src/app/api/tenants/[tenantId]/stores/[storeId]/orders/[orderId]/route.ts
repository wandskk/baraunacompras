import { NextResponse } from "next/server";
import { OrderController } from "@/modules/order/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { orderParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; orderId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    orderParamsSchema.parse(rawParams);
    const { tenantId, orderId } = rawParams;
    const controller = new OrderController();
    const order = await controller.getById(orderId, tenantId);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    orderParamsSchema.parse(rawParams);
    const { tenantId, orderId } = rawParams;
    const body = await request.json();
    const controller = new OrderController();
    const order = await controller.update(orderId, tenantId, body);
    return NextResponse.json(order);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    orderParamsSchema.parse(rawParams);
    const { tenantId, orderId } = rawParams;
    const controller = new OrderController();
    await controller.delete(orderId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
