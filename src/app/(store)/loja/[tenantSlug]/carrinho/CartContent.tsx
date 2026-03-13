"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button, LoadingSpinner } from "@/components/ui";
import { formatCurrency } from "@/lib/format";

type CartItem = {
  id: string;
  productId: string;
  product: { id: string; name: string; slug?: string; price: string; imageUrl?: string | null };
  quantity: number;
  variation?: string;
  size?: string;
  subtotal: number;
};

type CartData = {
  cart: { id: string } | null;
  items: CartItem[];
  total: number;
};

type Props = {
  tenantSlug: string;
  tenantId: string;
  storeId: string;
};

export function CartContent({ tenantSlug, tenantId, storeId }: Props) {
  const [data, setData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  async function fetchCart() {
    try {
      const res = await fetch(`/api/public/${tenantSlug}/cart`, {
        credentials: "include",
      });
      if (res.ok) {
        const json = await res.json();
        setData({ cart: json.cart, items: json.items ?? [], total: json.total ?? 0 });
      } else {
        setData({ cart: null, items: [], total: 0 });
      }
    } catch {
      setData({ cart: null, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCart();
  }, [tenantSlug]);

  async function updateQuantity(itemId: string, quantity: number) {
    if (!data?.cart) return;
    setUpdating(itemId);
    try {
      const res = await fetch(
        `/api/public/${tenantSlug}/cart/items/${itemId}?cartId=${data.cart.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        }
      );
      if (res.ok) {
        const json = await res.json();
        setData({ cart: json.cart, items: json.items ?? [], total: json.total ?? 0 });
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(itemId: string) {
    if (!data?.cart) return;
    setUpdating(itemId);
    try {
      const res = await fetch(
        `/api/public/${tenantSlug}/cart/items/${itemId}?cartId=${data.cart.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        const json = await res.json();
        setData({ cart: json.cart, items: json.items ?? [], total: json.total ?? 0 });
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Carregando carrinho..." minHeight="200px" />;
  }

  if (!data?.items?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <p className="text-gray-500">Seu carrinho está vazio</p>
        <Link href={`/loja/${tenantSlug}`}>
          <Button className="mt-4">Ver produtos</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-200">
            {data.items.map((item) => {
              const hasOptions = item.variation || item.size;
              return (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {item.product.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ShoppingBag className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/loja/${tenantSlug}/produtos/${(item.product as { slug?: string }).slug ?? item.productId}`}
                    className="font-medium text-gray-900 hover:text-primary hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  {hasOptions && (
                    <p className="mt-0.5 text-sm font-medium text-primary">
                      {item.variation && <span>Variação: {item.variation}</span>}
                      {item.variation && item.size && " • "}
                      {item.size && <span>Tamanho: {item.size}</span>}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.product.price)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={!!updating || item.quantity <= 1}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!!updating}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    disabled={!!updating}
                  >
                    Remover
                  </Button>
                </div>
                <p className="w-24 text-right font-semibold text-primary">
                  {formatCurrency(item.subtotal)}
                </p>
              </li>
            );
            })}
          </ul>
        </div>
      </div>
      <div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            {formatCurrency(data.total)}
          </p>
          <Link href={`/loja/${tenantSlug}/checkout?cartId=${data.cart?.id}`} className="mt-4 block">
            <Button fullWidth>Finalizar compra</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
