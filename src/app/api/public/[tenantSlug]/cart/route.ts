import { NextRequest, NextResponse } from "next/server";
import { getPublicStore } from "@/lib/store-public";
import { CartService } from "@/modules/cart/services";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantSlugParamSchema } from "@/lib/params-schemas";

const CART_COOKIE = "barauna_cart";
const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type Params = { params: Promise<{ tenantSlug: string }> };

function getCartIdFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${CART_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]+)`));
  return match ? match[1] : null;
}

function setCartCookie(cartId: string): string {
  return `${CART_COOKIE}=${cartId}; Path=/; Max-Age=${CART_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const rawParams = await params;
    tenantSlugParamSchema.parse(rawParams);
    const { tenantSlug } = rawParams;
    const data = await getPublicStore(tenantSlug);
    if (!data) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }
    const cartId = getCartIdFromCookie(request.headers.get("cookie"));
    if (!cartId) {
      return NextResponse.json({ cart: null, items: [] });
    }
    const cartService = new CartService();
    try {
      const cart = await cartService.getById(cartId, data.tenantId);
      if (cart.storeId !== data.store.id) {
        return NextResponse.json({ cart: null, items: [] });
      }
      const items = (cart.items ?? []).map((i) => ({
        id: i.id,
        productId: i.productId,
        product: i.product,
        quantity: i.quantity,
        subtotal: Number(i.product.price) * i.quantity,
      }));
      const total = items.reduce((s, i) => s + i.subtotal, 0);
      return NextResponse.json({ cart: { id: cart.id }, items, total });
    } catch {
      return NextResponse.json({ cart: null, items: [] });
    }
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const rawParams = await params;
    tenantSlugParamSchema.parse(rawParams);
    const { tenantSlug } = rawParams;
    const data = await getPublicStore(tenantSlug);
    if (!data) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }
    const body = await request.json().catch(() => ({}));
    const cartService = new CartService();
    let cartId = getCartIdFromCookie(request.headers.get("cookie"));
    if (!cartId) {
      const cart = await cartService.create({
        tenantId: data.tenantId,
        storeId: data.store.id,
      });
      cartId = cart.id;
    } else {
      try {
        await cartService.getById(cartId, data.tenantId);
      } catch {
        const cart = await cartService.create({
          tenantId: data.tenantId,
          storeId: data.store.id,
        });
        cartId = cart.id;
      }
    }
    if (body.productId && body.quantity) {
      await cartService.addItem(cartId, data.tenantId, {
        productId: body.productId,
        quantity: body.quantity ?? 1,
      });
    }
    const cart = await cartService.getById(cartId, data.tenantId);
    const items = (cart.items ?? []).map((i) => ({
      id: i.id,
      productId: i.productId,
      product: i.product,
      quantity: i.quantity,
      subtotal: Number(i.product.price) * i.quantity,
    }));
    const total = items.reduce((s, i) => s + i.subtotal, 0);
    const res = NextResponse.json({ cart: { id: cart.id }, items, total }, { status: 201 });
    res.headers.set("Set-Cookie", setCartCookie(cartId));
    return res;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
