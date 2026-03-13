import { NextResponse } from "next/server";
import { CategoryController } from "@/modules/category/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantIdParamSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    tenantIdParamSchema.parse(rawParams);
    const { tenantId } = rawParams;
    const controller = new CategoryController();
    const categories = await controller.listByTenant(tenantId);
    return NextResponse.json(categories);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    tenantIdParamSchema.parse(rawParams);
    const { tenantId } = rawParams;
    const body = await request.json();
    const controller = new CategoryController();
    const category = await controller.create({ ...body, tenantId });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
