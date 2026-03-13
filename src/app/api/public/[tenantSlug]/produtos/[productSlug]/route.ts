import { NextResponse } from "next/server";
import { getPublicProduct } from "@/lib/store-public";

type Params = {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantSlug, productSlug } = await params;
    const product = await getPublicProduct(tenantSlug, productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
