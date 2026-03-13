import { NextResponse } from "next/server";
import { CustomerController } from "@/modules/customer/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const controller = new CustomerController();
    const customers = await controller.listByStore(storeId, tenantId);
    return NextResponse.json(customers);
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
    const controller = new CustomerController();
    const customer = await controller.create({
      ...body,
      tenantId,
      storeId,
    });
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
