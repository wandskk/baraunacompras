import { NextResponse } from "next/server";
import { StoreController } from "@/modules/store/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantIdParamSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    tenantIdParamSchema.parse(rawParams);
    const { tenantId } = rawParams;
    const controller = new StoreController();
    const stores = await controller.listByTenant(tenantId);
    return NextResponse.json(stores);
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
    const controller = new StoreController();
    const store = await controller.create({ ...body, tenantId });
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
