import { NextResponse } from "next/server";
import { CartController } from "@/modules/cart/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { cartItemParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; cartId: string; productId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    cartItemParamsSchema.parse(rawParams);
    const { tenantId, cartId, productId } = rawParams;
    const body = await request.json();
    const controller = new CartController();
    const cart = await controller.updateItemQuantity(cartId, tenantId, productId, body);
    return NextResponse.json(cart);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    cartItemParamsSchema.parse(rawParams);
    const { tenantId, cartId, productId } = rawParams;
    const controller = new CartController();
    const cart = await controller.removeItem(cartId, tenantId, productId);
    return NextResponse.json(cart);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
