import { NextResponse } from "next/server";
import { CustomerController } from "@/modules/customer/controllers";
import { apiErrorResponse } from "@/lib/api-errors";
import { customerParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; customerId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    customerParamsSchema.parse(rawParams);
    const { tenantId, customerId } = rawParams;
    const controller = new CustomerController();
    const customer = await controller.getById(customerId, tenantId);
    return NextResponse.json(customer);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    customerParamsSchema.parse(rawParams);
    const { tenantId, customerId } = rawParams;
    const body = await request.json();
    const controller = new CustomerController();
    const customer = await controller.update(customerId, tenantId, body);
    return NextResponse.json(customer);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    customerParamsSchema.parse(rawParams);
    const { tenantId, customerId } = rawParams;
    const controller = new CustomerController();
    await controller.delete(customerId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
