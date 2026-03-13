"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

type Props = {
  tenantSlug: string;
  productId: string;
  productName?: string;
  disabled?: boolean;
};

export function AddToCartButton({ tenantSlug, productId, disabled }: Props) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/public/${tenantSlug}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
        credentials: "include",
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        window.dispatchEvent(new CustomEvent("cart-updated"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading || disabled}
      fullWidth
      variant={added ? "secondary" : undefined}
    >
      {added ? "Adicionado! ✓" : "Adicionar ao carrinho"}
    </Button>
  );
}
