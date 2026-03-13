"use client";

import Link from "next/link";
import { AddToCartButton } from "./produtos/[productSlug]/AddToCartButton";
import { Button } from "@/components/ui";

type Props = {
  tenantSlug: string;
  productId: string;
  checkoutUrl: string;
  available: boolean;
};

export function ProductCardActions({
  tenantSlug,
  productId,
  checkoutUrl,
  available,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <AddToCartButton
        tenantSlug={tenantSlug}
        productId={productId}
        disabled={!available}
      />
      <Link href={checkoutUrl} className="block">
        <Button
          variant="outline"
          fullWidth
          disabled={!available}
          className="w-full"
        >
          Comprar agora
        </Button>
      </Link>
    </div>
  );
}
