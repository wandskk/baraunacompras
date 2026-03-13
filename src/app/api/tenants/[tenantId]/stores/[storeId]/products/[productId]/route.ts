import { NextResponse } from "next/server";
import { ProductController } from "@/modules/product/controllers";

type Params = {
  params: Promise<{ tenantId: string; storeId: string; productId: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, productId } = await params;
    const controller = new ProductController();
    const product = await controller.getById(productId, tenantId);
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { tenantId, productId } = await params;
    const body = await request.json();
    const controller = new ProductController();
    const product = await controller.update(productId, tenantId, body);
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, productId } = await params;
    const controller = new ProductController();
    await controller.delete(productId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
