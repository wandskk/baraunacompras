"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "./produtos/[productSlug]/AddToCartButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  price: { toString: () => string } | string | number;
  category?: { name: string } | null;
};

type Props = {
  tenantSlug: string;
  product: Product;
  available: boolean;
};

export function StoreProductCard({ tenantSlug, product, available }: Props) {
  const productUrl = `/loja/${tenantSlug}/produtos/${product.slug}`;
  const price = Number(product.price);

  return (
    <article
      className={`font-product group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md ${!available ? "opacity-70" : ""}`}
    >
      <Link href={productUrl} className="flex flex-1 flex-col">
        {product.imageUrl ? (
          <div className="aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        ) : (
          <div className="flex aspect-square items-center justify-center bg-secondary">
            <span className="text-4xl text-secondary-foreground/40">📦</span>
          </div>
        )}
        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-lg font-bold text-primary">
            {formatCurrency(price)}
          </p>
          {!available && (
            <span className="mt-1 text-xs text-gray-500">Indisponível</span>
          )}
        </div>
      </Link>
      <div className="border-t border-gray-100 p-3 sm:p-4">
        <AddToCartButton
          tenantSlug={tenantSlug}
          productId={product.id}
          disabled={!available}
        />
      </div>
    </article>
  );
}
