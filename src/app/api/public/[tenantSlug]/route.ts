import { NextResponse } from "next/server";
import { getPublicStoreWithProducts } from "@/lib/store-public";

type Params = { params: Promise<{ tenantSlug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { tenantSlug } = await params;
    const data = await getPublicStoreWithProducts(tenantSlug);
    if (!data) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    return NextResponse.json({
      store: {
        id: data.store.id,
        name: data.store.name,
        slug: data.store.slug,
      },
      products: data.products,
      categories: data.categories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
