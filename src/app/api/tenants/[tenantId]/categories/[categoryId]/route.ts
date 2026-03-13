import { NextResponse } from "next/server";
import { CategoryController } from "@/modules/category/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { categoryParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; categoryId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    categoryParamsSchema.parse(rawParams);
    const { tenantId, categoryId } = rawParams;
    const controller = new CategoryController();
    const category = await controller.getById(categoryId, tenantId);
    return NextResponse.json(category);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    categoryParamsSchema.parse(rawParams);
    const { tenantId, categoryId } = rawParams;
    const body = await request.json();
    const controller = new CategoryController();
    const category = await controller.update(categoryId, tenantId, body);
    return NextResponse.json(category);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    categoryParamsSchema.parse(rawParams);
    const { tenantId, categoryId } = rawParams;
    const controller = new CategoryController();
    await controller.delete(categoryId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
