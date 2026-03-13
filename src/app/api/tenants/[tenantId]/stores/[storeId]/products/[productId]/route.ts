import { NextResponse } from "next/server";
import { ProductController } from "@/modules/product/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { productParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; productId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    productParamsSchema.parse(rawParams);
    const { tenantId, productId } = rawParams;
    const controller = new ProductController();
    const product = await controller.getById(productId, tenantId);
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    productParamsSchema.parse(rawParams);
    const { tenantId, productId } = rawParams;
    const body = await request.json();
    const controller = new ProductController();
    const product = await controller.update(productId, tenantId, body);
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    productParamsSchema.parse(rawParams);
    const { tenantId, productId } = rawParams;
    const controller = new ProductController();
    await controller.delete(productId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
