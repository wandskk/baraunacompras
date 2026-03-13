import { NextResponse } from "next/server";
import { TenantController } from "@/modules/tenant/controllers";
import { apiErrorResponse } from "@/lib/api-errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new TenantController();
    const tenant = await controller.create(body);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
