"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Search, Store, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicProductItem } from "@/lib/public-products";

const SUGESTOES_RAPIDAS = [
  "arroz",
  "café",
  "remédio",
  "material de construção",
  "bebidas",
  "moda",
];

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
    params.set("limit", "10");
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
      {/* Área de busca central */}
      <div
        className="mx-auto mt-8 w-full max-w-2xl opacity-0 animate-hero-scale"
        style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
      >
        <div
          className="relative flex overflow-hidden rounded-2xl border-2 border-navy/10 bg-white shadow-lg shadow-primary/5 ring-1 ring-white transition-all duration-300 focus-within:border-primary focus-within:shadow-xl focus-within:shadow-primary/10 focus-within:ring-2 focus-within:ring-primary/20"
          role="search"
          aria-label="Buscar produtos"
        >
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/60 sm:h-6 sm:w-6" />
          <input
            type="search"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="O que você procura? Ex: arroz, café, remédio..."
            className="w-full rounded-l-2xl py-3.5 pl-12 pr-4 text-base font-medium text-navy outline-none placeholder:text-gray-400 sm:py-4 sm:pl-14 sm:text-lg"
            aria-label="Buscar produtos"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="shrink-0 rounded-r-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:px-6 sm:py-4"
            aria-label="Buscar"
          >
            Buscar
          </button>
        </div>

        {/* Chips de sugestão rápida */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-medium text-gray-500 sm:text-sm">
            Sugestões:
          </span>
          {SUGESTOES_RAPIDAS.map((termo) => (
            <button
              key={termo}
              type="button"
              onClick={() => {
                setInputValue(termo);
                fetchProducts(termo, 1);
              }}
              className="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/10 sm:px-3.5 sm:py-1.5 sm:text-sm"
            >
              {termo}
            </button>
          ))}
        </div>

        {/* Ação alternativa: ver lojas */}
        <div className="mt-4 flex justify-center">
          <Link
            href="#lojas-cadastradas"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            <Store className="h-4 w-4" />
            Ver lojas cadastradas
          </Link>
        </div>
      </div>

      {(products.length > 0 || loading) ? (
        <div className="mt-10 w-full">
          {/* Label clara da seção + paginação mobile (em cima, canto direito) */}
          <div className="mb-4 flex items-center justify-between gap-2 px-1">
            <h2 className="min-w-0 flex-1 text-base font-bold text-navy sm:text-lg">
              {loading
                ? "Buscando..."
                : searchQuery.trim()
                  ? `${pagination.total} resultado${pagination.total !== 1 ? "s" : ""} encontrado${pagination.total !== 1 ? "s" : ""}`
                  : "Produtos em destaque"}
            </h2>
            {hasPagination && !loading && (
              <>
                <span className="hidden text-xs text-gray-500 sm:inline sm:text-sm">
                  Página {pagination.page} de {totalPages}
                </span>
                <div className="flex shrink-0 items-center justify-end gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy/70 shadow-sm disabled:opacity-40"
                    aria-label="Página anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-navy">
                    {pagination.page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy/70 shadow-sm disabled:opacity-40"
                    aria-label="Próxima página"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {hasPagination && (
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="hidden shrink-0 items-center justify-center self-center rounded-full border border-navy/10 bg-white p-2.5 text-navy/70 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md disabled:pointer-events-none disabled:opacity-40 sm:flex sm:h-11 sm:w-11"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
            {loading ? (
              <div className="min-w-0 flex-1 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 10 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="min-w-0 flex-1 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {products.map((item) => (
              <Link
                key={item.id}
                href={`/loja/${item.storeSlug}/produtos/${item.slug}`}
                className={`font-product group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${item.isPromotion ? "border-amber-400/70 bg-amber-50/50 hover:border-amber-500/80" : "border-navy/10 bg-white hover:border-primary/25 hover:shadow-primary/5"}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  {item.isPromotion && (
                    <span className="absolute left-1.5 top-1.5 z-10 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black shadow-sm">
                      PROMO
                    </span>
                  )}
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${item.isPromotion ? "bg-amber-100/50" : "bg-primary/5"}`}>
                      <Package className={`h-10 w-10 sm:h-12 sm:w-12 ${item.isPromotion ? "text-amber-600/50" : "text-primary/30"}`} />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded-md bg-white/95 px-2 py-1 text-[10px] font-medium text-gray-600 shadow-sm sm:text-xs">
                    {item.storeName}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-2 sm:p-2.5">
                  <h3 className={`line-clamp-2 min-h-0 flex-1 text-xs font-semibold leading-tight sm:text-sm ${item.isPromotion ? "text-amber-900 group-hover:text-amber-800" : "text-navy group-hover:text-primary"}`}>
                    {item.name}
                  </h3>
                  <p className={`mt-auto pt-1.5 text-sm font-bold sm:text-base ${item.isPromotion ? "text-amber-800" : "text-primary"}`}>
                    {formatPrice(item.price)}
                    {item.originalPrice && (
                      <span className="ml-1 text-xs font-normal text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
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
                className="hidden shrink-0 items-center justify-center self-center rounded-full border border-navy/10 bg-white p-2.5 text-navy/70 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-md disabled:pointer-events-none disabled:opacity-40 sm:flex sm:h-11 sm:w-11"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>

          {/* Paginação mobile (em baixo, canto direito) */}
          {hasPagination && !loading && (
            <div className="mt-4 flex items-center justify-end gap-2 sm:hidden">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy/70 shadow-sm disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium text-navy">
                {pagination.page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-navy/15 bg-white text-navy/70 shadow-sm disabled:opacity-40"
                aria-label="Próxima página"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
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
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {!isEmptySearch && (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Limpar busca
              </button>
            )}
            <Link
              href="#lojas-cadastradas"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              <Store className="h-4 w-4" />
              Ver lojas cadastradas
            </Link>
          </div>
        </div>
      ) : null}

      <div
        className="mt-10 flex flex-col items-center gap-4 opacity-0 animate-hero-fade sm:flex-row sm:gap-6"
        style={{ animationDelay: "120ms", animationFillMode: "forwards" }}
      >
        <Link
          href="#lojas-cadastradas"
          className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 sm:px-8 sm:py-3.5 sm:text-base"
        >
          <Store className="h-4 w-4 sm:h-5 sm:w-5" />
          Ver todas as lojas
        </Link>
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
