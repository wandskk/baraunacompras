import { NextResponse } from "next/server";
import { CustomerController } from "@/modules/customer/controllers";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; customerId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, customerId } = await params;
    const controller = new CustomerController();
    const customer = await controller.getById(customerId, tenantId);
    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { tenantId, customerId } = await params;
    const body = await request.json();
    const controller = new CustomerController();
    const customer = await controller.update(customerId, tenantId, body);
    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, customerId } = await params;
    const controller = new CustomerController();
    await controller.delete(customerId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
