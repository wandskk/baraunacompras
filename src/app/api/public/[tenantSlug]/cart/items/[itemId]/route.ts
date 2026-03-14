import { NextRequest, NextResponse } from "next/server";
import { getPublicStore } from "@/lib/store-public";
import { CartService } from "@/modules/cart/services";
import { apiErrorResponse } from "@/lib/api-errors";
import { getEffectivePrice } from "@/lib/product-price";
import { z } from "zod";

const CART_COOKIE = "barauna_cart";

const updateSchema = z.object({ quantity: z.coerce.number().int().min(0) });

type Params = {
  params: Promise<{ tenantSlug: string; itemId: string }>;
};

function getCartIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]+)`));
  return match ? match[1] : null;
}

async function getStoreData(tenantSlug: string) {
  const data = await getPublicStore(tenantSlug);
  if (!data) {
    throw new Error("Loja não encontrada");
  }
  return data;
}

function mapItems(cart: { items?: Array<{ id: string; productId: string; product: { price: unknown; promotionalPrice?: unknown; promotionEndsAt?: unknown }; quantity: number; variation?: string; size?: string }> }) {
  return (cart.items ?? []).map((i) => {
    const price = getEffectivePrice(i.product);
    return {
      id: i.id,
      productId: i.productId,
      product: i.product,
      quantity: i.quantity,
      variation: i.variation ?? "",
      size: i.size ?? "",
      subtotal: price * i.quantity,
    };
  });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { tenantSlug, itemId } = await params;
    const data = await getStoreData(tenantSlug);
    const cartId = getCartIdFromCookie(request.headers.get("cookie")) ?? request.nextUrl.searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const { quantity } = updateSchema.parse(body);
    const cartService = new CartService();
    const cart = await cartService.updateItemQuantityById(cartId, data.tenantId, itemId, { quantity });
    const items = mapItems(cart);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return NextResponse.json({ cart: { id: cart.id }, items, total });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { tenantSlug, itemId } = await params;
    const data = await getStoreData(tenantSlug);
    const cartId = getCartIdFromCookie(request.headers.get("cookie")) ?? request.nextUrl.searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 400 });
    }
    const cartService = new CartService();
    const cart = await cartService.removeItemById(cartId, data.tenantId, itemId);
    const items = mapItems(cart);
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return NextResponse.json({ cart: { id: cart.id }, items, total });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
