import { NextResponse } from "next/server";
import { OrderController } from "@/modules/order/controllers";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; orderId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, orderId } = await params;
    const controller = new OrderController();
    const order = await controller.getById(orderId, tenantId);
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { tenantId, orderId } = await params;
    const body = await request.json();
    const controller = new OrderController();
    const order = await controller.update(orderId, tenantId, body);
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, orderId } = await params;
    const controller = new OrderController();
    await controller.delete(orderId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
