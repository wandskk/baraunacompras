import { NextResponse } from "next/server";
import { CartController } from "@/modules/cart/controllers";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; cartId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, cartId } = await params;
    const controller = new CartController();
    const cart = await controller.getById(cartId, tenantId);
    return NextResponse.json(cart);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, cartId } = await params;
    const controller = new CartController();
    await controller.delete(cartId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
