"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Product = {
  id: string;
  name: string;
  price: { toString: () => string };
  stock?: number;
  variations?: string[];
  sizes?: string[];
};

type Props = {
  tenantSlug: string;
  product: Product;
  available: boolean;
};

export function ProductPurchaseSection({
  tenantSlug,
  product,
  available,
}: Props) {
  const [variation, setVariation] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const variations = product.variations ?? [];
  const sizes = product.sizes ?? [];
  const hasVariations = variations.length > 0;
  const hasSizes = sizes.length > 0;
  const needsSelection = hasVariations || hasSizes;
  const canAdd =
    !needsSelection ||
    (hasVariations && variation && hasSizes && size) ||
    (hasVariations && variation && !hasSizes) ||
    (!hasVariations && hasSizes && size);

  async function handleAddToCart() {
    if (!canAdd) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/public/${tenantSlug}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          variation: variation || undefined,
          size: size || undefined,
        }),
        credentials: "include",
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        window.dispatchEvent(new CustomEvent("cart-updated"));
      } else {
        const data = await res.json();
        alert(data.error ?? "Erro ao adicionar");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyNow() {
    if (!canAdd) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/public/${tenantSlug}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          variation: variation || undefined,
          size: size || undefined,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.cart?.id) {
        window.location.href = `/loja/${tenantSlug}/checkout?cartId=${data.cart.id}`;
      } else if (!res.ok) {
        alert(data.error ?? "Erro ao adicionar");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {hasVariations && (
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-gray-700">
            Variação
          </legend>
          <div className="flex flex-wrap gap-3">
            {variations.map((v) => (
              <label
                key={v}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="radio"
                  name="variation"
                  value={v}
                  checked={variation === v}
                  onChange={(e) => setVariation(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {hasSizes && (
        <fieldset>
          <legend className="mb-2 block text-sm font-medium text-gray-700">
            Tamanho
          </legend>
          <div className="flex flex-wrap gap-3">
            {sizes.map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
              >
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={(e) => setSize(e.target.value)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="sm:flex-1 [&_button]:h-11">
          <Button
            onClick={handleAddToCart}
            disabled={loading || !available || !canAdd}
            fullWidth
            variant={added ? "secondary" : undefined}
          >
            {added
              ? "Adicionado! ✓"
              : !canAdd && needsSelection
                ? "Selecione as opções"
                : "Adicionar ao carrinho"}
          </Button>
        </div>
        {available ? (
          canAdd ? (
            <Button
              variant="outline"
              onClick={handleBuyNow}
              disabled={loading}
              className="h-11 flex-1 sm:flex-initial"
            >
              Comprar agora
            </Button>
          ) : (
            <span className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border-2 border-gray-300 px-4 font-medium text-gray-400 opacity-50 sm:flex-initial">
              Selecione as opções
            </span>
          )
        ) : (
          <span className="flex h-11 flex-1 cursor-not-allowed items-center justify-center rounded-lg border-2 border-gray-300 px-4 font-medium text-gray-400 opacity-50 sm:flex-initial">
            Comprar agora
          </span>
        )}
      </div>
    </div>
  );
}
