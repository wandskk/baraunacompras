import { NextRequest, NextResponse } from "next/server";
import { ProductController } from "@/modules/product/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";
import { searchSchema } from "@/lib/schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const { searchParams } = request.nextUrl;
    const opts = searchSchema.parse({
      q: searchParams.get("q") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const controller = new ProductController();
    const result = await controller.listByStore(storeId, tenantId, opts);
    return NextResponse.json(result);
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
    const controller = new ProductController();
    const product = await controller.create({ ...body, tenantId, storeId });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
