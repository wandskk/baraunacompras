"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { getEffectivePrice, isProductOnPromotion } from "@/lib/product-price";
import { Button } from "@/components/ui";
import { AddToCartButton } from "./produtos/[productSlug]/AddToCartButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  price: { toString: () => string } | string | number;
  promotionalPrice?: { toString: () => string } | string | number | null;
  promotionEndsAt?: Date | string | null;
  category?: { name: string } | null;
};

type Props = {
  tenantSlug: string;
  product: Product;
  available: boolean;
};

export function StoreProductCard({ tenantSlug, product, available }: Props) {
  const productUrl = `/loja/${tenantSlug}/produtos/${product.slug}`;
  const price = getEffectivePrice(product);
  const onPromo = isProductOnPromotion(product);
  const originalPrice = onPromo ? Number(product.price) : null;

  return (
    <article
      className={`font-product group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:shadow-md ${onPromo ? "border-primary/50 bg-primary/5 hover:border-primary/70" : "border-gray-200 bg-white"} ${!available ? "opacity-70" : ""}`}
    >
      <Link href={productUrl} className="flex flex-1 flex-col">
        <div className="relative">
        {onPromo && (
          <span className="absolute left-2 top-2 z-10 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
            PROMO
          </span>
        )}
        {product.imageUrl ? (
          <div className="aspect-square overflow-hidden bg-gray-100 p-3 sm:p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className={`flex aspect-square items-center justify-center ${onPromo ? "bg-primary/10" : "bg-secondary"}`}>
            <span className="text-4xl text-secondary-foreground/40">📦</span>
          </div>
        )}
        </div>
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-lg font-bold text-primary">
            {formatCurrency(price)}
            {originalPrice != null && originalPrice > price && (
              <span className="ml-1.5 text-sm font-normal text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
            )}
          </p>
          {!available && (
            <span className="mt-1 text-xs text-gray-500">Indisponível</span>
          )}
        </div>
      </Link>
      <div className="flex flex-col gap-2 border-t border-gray-100 p-3 sm:p-4">
        <AddToCartButton
          tenantSlug={tenantSlug}
          productId={product.id}
          disabled={!available}
        />
        {available ? (
          <Link href={`/loja/${tenantSlug}/checkout?productId=${product.id}`}>
            <Button variant="outline" fullWidth className="w-full">
              Comprar agora
            </Button>
          </Link>
        ) : (
          <Button variant="outline" fullWidth disabled className="w-full">
            Comprar agora
          </Button>
        )}
      </div>
    </article>
  );
}
