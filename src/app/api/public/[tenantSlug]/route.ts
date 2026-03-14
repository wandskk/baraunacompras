import { NextRequest, NextResponse } from "next/server";
import { getPublicStoreWithProducts } from "@/lib/store-public";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantSlugParamSchema } from "@/lib/params-schemas";
import { searchSchema } from "@/lib/schemas";

type Params = { params: Promise<{ tenantSlug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const rawParams = await params;
    tenantSlugParamSchema.parse(rawParams);
    const { tenantSlug } = rawParams;
    const { searchParams } = request.nextUrl;
    const filters = searchSchema.parse({
      q: searchParams.get("q") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });
    const data = await getPublicStoreWithProducts(tenantSlug, filters);
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
      pagination: data.pagination,
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
