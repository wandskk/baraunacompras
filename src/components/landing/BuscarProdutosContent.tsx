"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Search, Store, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="font-product flex flex-col overflow-hidden rounded-lg border border-navy/10 bg-white shadow-sm">
      <div className="relative aspect-[4/3] shrink-0 animate-pulse bg-gray-200" />
      <div className="flex flex-1 flex-col p-1.5 sm:p-2">
        <div className="min-h-[2.25rem] flex-1 space-y-0.5 sm:min-h-[2.5rem]">
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200 sm:h-3.5" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 sm:h-3.5" />
        </div>
        <div className="mt-auto pt-1">
          <div className="h-3.5 w-1/3 animate-pulse rounded bg-gray-100 sm:h-4" />
        </div>
      </div>
    </div>
  );
}

type Pagination = { page: number; limit: number; total: number };

type Props = {
  initialProducts: PublicProductItem[];
  initialPagination: Pagination;
};

export function BuscarProdutosContent({
  initialProducts,
  initialPagination,
}: Props) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<PublicProductItem[]>(initialProducts);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(false);

  const fetchProducts = (q: string, page = 1) => {
    setLoading(true);
    if (page === 1) setSearchQuery(q);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(page));
    params.set("limit", "12");
    fetch(`/api/public/products?${params}`)
      .then((res) => res.json())
      .then((data: { products: PublicProductItem[]; pagination: Pagination }) => {
        setProducts(data.products);
        setPagination(data.pagination);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    fetchProducts(inputValue.trim(), 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!value.trim()) fetchProducts("", 1);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(searchQuery, page);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setInputValue("");
    fetchProducts("", 1);
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const hasPagination = totalPages > 1;

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
      </div>

      {(products.length > 0 || loading) ? (
        <div className="mt-6">
          <div className="flex items-center gap-1 sm:gap-2">
            {hasPagination && (
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white text-navy/70 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
            {loading ? (
              <div
                className="min-w-0 flex-1 grid grid-cols-4 gap-2 opacity-0 animate-hero-scale sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 sm:gap-3"
                style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div
                className="min-w-0 flex-1 grid grid-cols-4 gap-2 opacity-0 animate-hero-scale sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 sm:gap-3"
                style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
              >
              {products.map((item) => (
              <Link
                key={item.id}
                href={`/loja/${item.storeSlug}/produtos/${item.slug}`}
                className="font-product group flex flex-col overflow-hidden rounded-lg border border-navy/10 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50">
                      <Package className="h-10 w-10 text-gray-300 sm:h-12 sm:w-12" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-white/95 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                    {item.storeName}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-1.5 sm:p-2">
                  <h3 className="line-clamp-2 min-h-0 flex-1 text-xs font-semibold leading-tight text-navy sm:text-sm group-hover:text-primary">
                    {item.name}
                  </h3>
                  <p className="mt-auto pt-1 text-sm font-bold text-primary sm:text-base">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </Link>
            ))}
              </div>
            )}
            {hasPagination && (
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy/10 bg-white text-navy/70 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md disabled:pointer-events-none disabled:opacity-40 sm:h-10 sm:w-10"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>
        </div>
      ) : null}
      {products.length === 0 && !loading ? (
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
      ) : null}

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
