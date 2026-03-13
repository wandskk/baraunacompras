import { NextRequest, NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/public-products";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q") ?? undefined;
    const products = await getPublicProducts(q);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
