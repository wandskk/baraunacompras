"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Search, ChevronRight, Store, ArrowRight } from "lucide-react";

type ProductItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  price: string;
  storeName: string;
  tenantSlug: string;
  storeSlug: string;
};

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
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#202C59]/10 bg-white">
      <div className="aspect-square animate-pulse bg-gray-200" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="mt-2 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function BuscarProdutosSection() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/public/products?q=${encodeURIComponent(query)}`)
        .then((res) => res.json())
        .then((data) => setProducts(data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const isEmptySearch = !query.trim();

  return (
    <section
      id="buscar-produtos"
      className="scroll-mt-20 bg-gradient-to-br from-white to-[#2266B0]/5 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2266B0]/10 px-4 py-2 text-sm font-medium text-[#2266B0]">
            <Package className="h-4 w-4" />
            Produtos
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#202C59] sm:text-4xl lg:text-5xl">
            Buscar produtos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Encontre os produtos que você precisa nas lojas de Baraúna.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome do produto..."
              className="w-full rounded-xl border border-[#202C59]/20 py-3 pl-11 pr-4 text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2266B0] focus:ring-2 focus:ring-[#2266B0]/20"
              aria-label="Buscar produtos"
            />
          </div>
          {!loading && products.length > 0 && (
            <p className="mt-2 text-center text-sm text-gray-500">
              {products.length} produto{products.length !== 1 ? "s" : ""}{" "}
              encontrado{products.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((item) => (
              <Link
                key={item.id}
                href={`/loja/${item.tenantSlug}--${item.storeSlug}/produtos/${item.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-[#202C59]/10 bg-white shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#2266B0]/30 hover:shadow-lg"
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
                    <Store className="h-3 w-3 text-[#2266B0]" />
                    {item.storeName}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-2 text-base font-semibold leading-snug text-[#202C59] transition-colors group-hover:text-[#2266B0]">
                    {item.name}
                  </h3>
                  <div className="mt-3 flex items-end justify-between gap-2">
                    <p className="text-xl font-bold text-[#2F8743]">
                      {formatPrice(item.price)}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#2266B0] opacity-0 transition-opacity group-hover:opacity-100">
                      Ver
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-[#202C59]/20 bg-[#2266B0]/5 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2266B0]/10">
              <Package className="h-8 w-8 text-[#2266B0]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#202C59]">
              {isEmptySearch
                ? "Nenhum produto cadastrado ainda"
                : "Nenhum produto encontrado"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              {isEmptySearch
                ? "As lojas ainda não cadastraram produtos. Explore as lojas ou tente novamente mais tarde."
                : `Não encontramos resultados para "${query}". Tente outros termos.`}
            </p>
            {!isEmptySearch && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-6 text-sm font-medium text-[#2266B0] hover:underline"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/loja"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Ver todas as lojas
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-3 font-medium text-primary transition-opacity hover:bg-primary/10"
          >
            Quero cadastrar minha loja
          </Link>
        </div>
      </div>
    </section>
  );
}
