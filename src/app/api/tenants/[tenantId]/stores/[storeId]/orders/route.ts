import { NextResponse } from "next/server";
import { OrderController } from "@/modules/order/controllers";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const controller = new OrderController();
    const orders = await controller.listByStore(storeId, tenantId);
    return NextResponse.json(orders);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const body = await request.json();
    const controller = new OrderController();
    const order = await controller.create({
      ...body,
      tenantId,
      storeId,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
