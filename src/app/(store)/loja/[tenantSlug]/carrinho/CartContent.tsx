"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Button, LoadingSpinner } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { toast } from "@/lib/toast";

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
        toast.success("Quantidade atualizada");
      } else {
        toast.error("Erro ao atualizar quantidade");
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
        toast.success("Item removido do carrinho");
      } else {
        toast.error("Erro ao remover item");
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
      <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ShoppingBag className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-navy">Seu carrinho está vazio</h2>
        <p className="mt-2 text-sm text-gray-500">Adicione produtos para continuar comprando</p>
        <Link href={`/loja/${tenantSlug}`} className="mt-6 inline-block">
          <Button>Ver produtos</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-6 pb-28 lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:pb-0">
      {/* Lista de itens */}
      <div className="space-y-4">
        {data.items.map((item) => {
          const hasOptions = item.variation || item.size;
          return (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center"
            >
              {/* Mobile/Tablet: imagem + info em linha, controles abaixo */}
              <div className="flex flex-1 gap-4 p-4 sm:p-5">
                <Link
                  href={`/loja/${tenantSlug}/produtos/${(item.product as { slug?: string }).slug ?? item.productId}`}
                  className="shrink-0"
                >
                  <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary/20 sm:h-24 sm:w-24">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary/60">
                        <ShoppingBag className="h-9 w-9 sm:h-10 sm:w-10" />
                      </div>
                    )}
                  </div>
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/loja/${tenantSlug}/produtos/${(item.product as { slug?: string }).slug ?? item.productId}`}
                    className="font-medium text-navy transition-colors hover:text-primary line-clamp-2"
                  >
                    {item.product.name}
                  </Link>
                  {hasOptions && (
                    <p className="mt-1 text-sm font-medium text-primary">
                      {item.variation && <span>Variação: {item.variation}</span>}
                      {item.variation && item.size && " • "}
                      {item.size && <span>Tamanho: {item.size}</span>}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {formatCurrency(item.product.price)} × {item.quantity}
                  </p>
                  <p className="mt-2 text-base font-semibold text-primary sm:hidden">
                    {formatCurrency(item.subtotal)}
                  </p>
                </div>
              </div>
              {/* Controles e preço */}
              <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-4 py-3 sm:border-t-0 sm:border-l sm:bg-transparent sm:px-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-navy/15 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={!!updating || item.quantity <= 1}
                      className="flex h-10 w-10 items-center justify-center text-navy/80 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-navy sm:w-8">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={!!updating}
                      className="flex h-10 w-10 items-center justify-center text-navy/80 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 sm:h-9 sm:w-9"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={!!updating}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-9 sm:w-9"
                    title="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="hidden text-right font-semibold text-primary sm:block sm:w-24">
                  {formatCurrency(item.subtotal)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {/* Resumo - sticky no desktop */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">Total</span>
            <span className="text-2xl font-bold text-primary">{formatCurrency(data.total)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            {data.items.length} {data.items.length === 1 ? "item" : "itens"}
          </p>
          <Link href={`/loja/${tenantSlug}/checkout?cartId=${data.cart?.id}`} className="mt-6 block">
            <Button fullWidth className="h-12 text-base font-semibold">
              Finalizar compra
            </Button>
          </Link>
          <Link
            href={`/loja/${tenantSlug}`}
            className="mt-4 block text-center text-sm font-medium text-accent hover:underline"
          >
            Continuar comprando
          </Link>
        </div>
      </div>
    </div>

    {/* Barra fixa no mobile para finalizar compra */}
    <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-navy/10 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(32,44,89,0.08)] backdrop-blur-sm lg:hidden">
      <div>
        <p className="text-xs font-medium text-gray-500">Total</p>
        <p className="text-lg font-bold text-primary">{formatCurrency(data.total)}</p>
      </div>
      <Link
        href={`/loja/${tenantSlug}/checkout?cartId=${data.cart?.id}`}
        className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Finalizar compra
      </Link>
    </div>
    </>
  );
}
