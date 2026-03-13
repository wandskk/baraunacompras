import { NextResponse } from "next/server";
import { CartController } from "@/modules/cart/controllers";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const controller = new CartController();
    const carts = await controller.listByStore(storeId, tenantId);
    return NextResponse.json(carts);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const body = await request.json();
    const controller = new CartController();
    const cart = await controller.create({ ...body, tenantId, storeId });
    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
