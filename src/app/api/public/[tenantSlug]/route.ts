import { NextResponse } from "next/server";
import { getPublicStoreWithProducts } from "@/lib/store-public";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantSlugParamSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantSlug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    tenantSlugParamSchema.parse(rawParams);
    const { tenantSlug } = rawParams;
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
    return apiErrorResponse(error);
  }
}
