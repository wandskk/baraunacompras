import { NextRequest, NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/public-products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q") ?? undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = 10;
    const { products, pagination } = await getPublicProducts(q, page, limit);
    return NextResponse.json({ products, pagination });
  } catch {
    return NextResponse.json(
      { products: [], pagination: { page: 1, limit: 10, total: 0 } },
      { status: 200 },
    );
  }
}
