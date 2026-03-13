import { NextRequest, NextResponse } from "next/server";
import { getPublicStore } from "@/lib/store-public";
import { CartService } from "@/modules/cart/services";
import { apiErrorResponse } from "@/lib/api-errors";
import { z } from "zod";

const CART_COOKIE = "barauna_cart";

const updateSchema = z.object({ quantity: z.coerce.number().int().min(0) });

type Params = {
  params: Promise<{ tenantSlug: string; productId: string }>;
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

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { tenantSlug, productId } = await params;
    const data = await getStoreData(tenantSlug);
    const cartId = getCartIdFromCookie(request.headers.get("cookie")) ?? request.nextUrl.searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const { quantity } = updateSchema.parse(body);
    const cartService = new CartService();
    await cartService.getById(cartId, data.tenantId);
    const cart = await cartService.updateItemQuantity(cartId, data.tenantId, productId, { quantity });
    const items = (cart.items ?? []).map((i) => ({
      id: i.id,
      productId: i.productId,
      product: i.product,
      quantity: i.quantity,
      subtotal: Number(i.product.price) * i.quantity,
    }));
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return NextResponse.json({ cart: { id: cart.id }, items, total });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { tenantSlug, productId } = await params;
    const data = await getStoreData(tenantSlug);
    const cartId = getCartIdFromCookie(request.headers.get("cookie")) ?? request.nextUrl.searchParams.get("cartId");
    if (!cartId) {
      return NextResponse.json({ error: "Carrinho não encontrado" }, { status: 400 });
    }
    const cartService = new CartService();
    const cart = await cartService.removeItem(cartId, data.tenantId, productId);
    const items = (cart.items ?? []).map((i) => ({
      id: i.id,
      productId: i.productId,
      product: i.product,
      quantity: i.quantity,
      subtotal: Number(i.product.price) * i.quantity,
    }));
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    return NextResponse.json({ cart: { id: cart.id }, items, total });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
