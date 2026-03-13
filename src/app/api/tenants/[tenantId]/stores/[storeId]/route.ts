import { NextResponse } from "next/server";
import { StoreController } from "@/modules/store/controllers";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const controller = new StoreController();
    const store = await controller.getById(storeId, tenantId);
    return NextResponse.json(store);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const body = await request.json();
    const controller = new StoreController();
    const store = await controller.update(storeId, tenantId, body);
    return NextResponse.json(store);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const controller = new StoreController();
    await controller.delete(storeId, tenantId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
