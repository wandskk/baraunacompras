import { NextResponse } from "next/server";
import { StoreController } from "@/modules/store/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const controller = new StoreController();
    const store = await controller.getById(storeId, tenantId);
    return NextResponse.json(store);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const body = await request.json();
    const controller = new StoreController();
    const store = await controller.update(storeId, tenantId, body);
    return NextResponse.json(store);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const controller = new StoreController();
    await controller.delete(storeId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
