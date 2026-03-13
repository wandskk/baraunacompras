import { NextResponse } from "next/server";
import { getPublicProduct } from "@/lib/store-public";
import { apiErrorResponse } from "@/lib/api-errors";
import { publicProductParamsSchema } from "@/lib/params-schemas";

type Params = {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    publicProductParamsSchema.parse(rawParams);
    const { tenantSlug, productSlug } = rawParams;
    const product = await getPublicProduct(tenantSlug, productSlug);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
