"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Search, ChevronRight, Store, ArrowRight } from "lucide-react";
import type { PublicProductItem } from "@/lib/public-products";

function formatPrice(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-md sm:rounded-2xl">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

type Props = {
  initialProducts: PublicProductItem[];
};

export function BuscarProdutosContent({ initialProducts }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<PublicProductItem[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  const fetchProducts = (q: string) => {
    setLoading(true);
    setSearchQuery(q);
    fetch(`/api/public/products?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data: PublicProductItem[]) => setProducts(data))
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    fetchProducts(inputValue.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!value.trim()) fetchProducts("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setInputValue("");
    fetchProducts("");
  };

  const isEmptySearch = !searchQuery.trim();

  return (
    <>
      <div
        className="mx-auto mt-6 w-full max-w-2xl opacity-0 animate-hero-scale"
        style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
      >
        <div
          className="relative flex overflow-hidden rounded-2xl border-2 border-navy/10 bg-white/95 shadow-xl shadow-primary/10 ring-2 ring-white/50 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-2xl focus-within:shadow-primary/15 focus-within:ring-4 focus-within:ring-primary/10 backdrop-blur-sm"
          role="search"
          aria-label="Buscar produtos"
        >
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-primary/70" />
          <input
            type="search"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: arroz, café, remédio..."
            className="w-full rounded-l-2xl py-4 pl-14 pr-4 text-lg font-medium text-navy outline-none placeholder:text-gray-400"
            aria-label="Buscar produtos"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="shrink-0 rounded-r-xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Buscar"
          >
            Buscar
          </button>
        </div>
        {!loading && products.length > 0 && (
          <p className="mt-3 text-center text-sm text-gray-500">
            {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
            encontrado{products.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {loading ? (
        <div
          className="mt-8 grid grid-cols-2 gap-3 opacity-0 animate-hero-scale lg:grid-cols-4 lg:gap-4"
          style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div
          className="mt-8 grid grid-cols-2 gap-3 opacity-0 animate-hero-scale lg:grid-cols-4 lg:gap-4"
          style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
        >
          {products.map((item) => (
            <Link
              key={item.id}
              href={`/loja/${item.storeSlug}/produtos/${item.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-navy/10 bg-white shadow-md shadow-navy/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:rounded-2xl"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-50">
                    <Package className="h-20 w-20 text-gray-300" />
                  </div>
                )}
                <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm">
                  <Store className="h-3 w-3 text-primary" />
                  {item.storeName}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug text-navy transition-colors group-hover:text-primary">
                  {item.name}
                </h3>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(item.price)}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Ver
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div
          className="mt-8 rounded-2xl border-2 border-dashed border-navy/20 bg-white/80 p-8 text-center backdrop-blur-sm sm:p-12 opacity-0 animate-hero-scale"
          style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Package className="h-7 w-7 text-primary" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-navy">
            {isEmptySearch
              ? "Nenhum produto cadastrado ainda"
              : "Nenhum produto encontrado"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            {isEmptySearch
              ? "Explore as lojas ou tente novamente mais tarde."
              : `Não encontramos resultados para "${searchQuery}". Tente outros termos.`}
          </p>
          {!isEmptySearch && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-5 text-sm font-semibold text-primary hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}

      <div
        className="mt-8 flex justify-center opacity-0 animate-hero-fade"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 sm:px-8 sm:py-3.5 sm:text-base"
        >
          Quero cadastrar minha loja
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </div>
    </>
  );
}
