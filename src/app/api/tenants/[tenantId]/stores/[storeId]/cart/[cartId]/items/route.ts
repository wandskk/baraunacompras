import { NextResponse } from "next/server";
import { CartController } from "@/modules/cart/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { cartParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; cartId: string }>;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    cartParamsSchema.parse(rawParams);
    const { tenantId, cartId } = rawParams;
    const body = await request.json();
    const controller = new CartController();
    const item = await controller.addItem(cartId, tenantId, body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
