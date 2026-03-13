import { NextResponse } from "next/server";
import { CategoryController } from "@/modules/category/controllers";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId } = await params;
    const controller = new CategoryController();
    const categories = await controller.listByTenant(tenantId);
    return NextResponse.json(categories);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { tenantId } = await params;
    const body = await request.json();
    const controller = new CategoryController();
    const category = await controller.create({ ...body, tenantId });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
