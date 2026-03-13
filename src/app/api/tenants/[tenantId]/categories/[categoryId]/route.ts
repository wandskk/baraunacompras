import { NextResponse } from "next/server";
import { CategoryController } from "@/modules/category/controllers";

type Params = { params: Promise<{ tenantId: string; categoryId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, categoryId } = await params;
    const controller = new CategoryController();
    const category = await controller.getById(categoryId, tenantId);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { tenantId, categoryId } = await params;
    const body = await request.json();
    const controller = new CategoryController();
    const category = await controller.update(categoryId, tenantId, body);
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, categoryId } = await params;
    const controller = new CategoryController();
    await controller.delete(categoryId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
