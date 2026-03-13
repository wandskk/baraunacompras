import { NextResponse } from "next/server";
import { CartController } from "@/modules/cart/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { cartParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; cartId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    cartParamsSchema.parse(rawParams);
    const { tenantId, cartId } = rawParams;
    const controller = new CartController();
    const cart = await controller.getById(cartId, tenantId);
    return NextResponse.json(cart);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    cartParamsSchema.parse(rawParams);
    const { tenantId, cartId } = rawParams;
    const controller = new CartController();
    await controller.delete(cartId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
