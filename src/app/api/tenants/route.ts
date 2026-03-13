import { NextResponse } from "next/server";
import { TenantController } from "@/modules/tenant/controllers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new TenantController();
    const tenant = await controller.create(body);
    return NextResponse.json(tenant, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
