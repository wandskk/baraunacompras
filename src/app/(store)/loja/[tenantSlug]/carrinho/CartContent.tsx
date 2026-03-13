"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

type CartItem = {
  id: string;
  productId: string;
  product: { id: string; name: string; price: string };
  quantity: number;
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

  async function updateQuantity(productId: string, quantity: number) {
    if (!data?.cart) return;
    setUpdating(productId);
    try {
      const res = await fetch(
        `/api/public/${tenantSlug}/cart/items/${productId}?cartId=${data.cart.id}`,
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

  async function removeItem(productId: string) {
    if (!data?.cart) return;
    setUpdating(productId);
    try {
      const res = await fetch(
        `/api/public/${tenantSlug}/cart/items/${productId}?cartId=${data.cart.id}`,
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
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Carregando carrinho...</p>
      </div>
    );
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
            {data.items.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    R$ {Number(item.product.price).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border border-gray-300">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      disabled={!!updating || item.quantity <= 1}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={!!updating}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(item.productId)}
                    disabled={!!updating}
                  >
                    Remover
                  </Button>
                </div>
                <p className="w-24 text-right font-semibold text-primary">
                  R$ {item.subtotal.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-primary">
            R$ {data.total.toFixed(2)}
          </p>
          <Link href={`/loja/${tenantSlug}/checkout?cartId=${data.cart?.id}`} className="mt-4 block">
            <Button fullWidth>Finalizar compra</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
