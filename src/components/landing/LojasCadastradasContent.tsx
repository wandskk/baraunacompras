"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Store, ChevronRight, Search } from "lucide-react";
import type { PublicStoreItem } from "@/lib/public-stores";

type Props = {
  stores: PublicStoreItem[];
  ctaSlot?: React.ReactNode;
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function LojasCadastradasContent({ stores, ctaSlot }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const q = normalize(searchQuery.trim());
    return stores.filter((item) => {
      const name = normalize(item.store.name);
      const tenant = normalize(item.tenantName);
      const desc = item.store.description
        ? normalize(item.store.description)
        : "";
      return name.includes(q) || tenant.includes(q) || desc.includes(q);
    });
  }, [stores, searchQuery]);

  const displayedStores = filteredStores.slice(0, 9);

  const handleSearch = () => {
    setSearchQuery(inputValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (!value.trim()) setSearchQuery("");
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="mt-4">
      {/* Hero de busca - destaque com identidade */}
      <div className="mx-auto max-w-2xl">
        <div
          className="relative flex overflow-hidden rounded-2xl border-2 border-navy/10 bg-white/95 shadow-xl shadow-primary/10 ring-2 ring-white/50 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-2xl focus-within:shadow-primary/15 focus-within:ring-4 focus-within:ring-primary/10 backdrop-blur-sm"
          role="search"
          aria-label="Buscar lojas"
        >
          <Search className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-primary/70" />
          <input
            type="search"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Buscar lojas (ex: mercearia, farmácia, padaria...)"
            className="w-full rounded-l-2xl py-4 pl-14 pr-4 text-lg font-medium text-navy outline-none placeholder:text-gray-400"
            aria-label="Buscar lojas"
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
        {stores.length > 0 && searchQuery.trim() && (
          <p className="mt-3 text-center text-sm text-gray-500">
            {filteredStores.length === stores.length
              ? `${displayedStores.length} loja${displayedStores.length !== 1 ? "s" : ""} disponíve${displayedStores.length !== 1 ? "is" : "l"}`
              : filteredStores.length > 9
                ? `Mostrando 9 de ${filteredStores.length} encontrada${filteredStores.length !== 1 ? "s" : ""}`
                : `${filteredStores.length} loja${filteredStores.length !== 1 ? "s" : ""} encontrada${filteredStores.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {/* CTA entre busca e lojas - visível no hero no mobile */}
      {ctaSlot && (
        <div className="mt-4 flex justify-center md:hidden">{ctaSlot}</div>
      )}

      {/* Lojas logo abaixo */}
      {displayedStores.length > 0 ? (
        <div className="mt-4 sm:mt-6">
          <h3 className="mb-3 text-base font-bold text-navy sm:mb-6 sm:text-xl">
            {searchQuery.trim()
              ? "Resultados da busca"
              : "Lojas disponíveis em Baraúna"}
          </h3>
          <div className="grid gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedStores.map((item) => (
              <Link
                key={`${item.tenantSlug}-${item.store.id}`}
                href={`/loja/${item.store.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-navy/10 bg-white/90 p-3 shadow-md shadow-navy/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 sm:gap-4 sm:rounded-2xl sm:p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-2 ring-primary/5 sm:h-16 sm:w-16 sm:rounded-xl">
                  {item.store.bannerUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.store.bannerUrl}
                      alt={item.store.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store className="h-5 w-5 text-primary sm:h-8 sm:w-8" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-semibold text-navy transition-colors group-hover:text-primary sm:text-base">
                    {item.store.name}
                  </h4>
                  <p className="mt-0.5 line-clamp-1 text-xs text-gray-500 sm:line-clamp-2 sm:text-sm">
                    {item.store.description ?? `Loja de ${item.tenantName}`}
                  </p>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white sm:h-10 sm:w-10">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-navy/10 bg-white/60 p-8 text-center backdrop-blur-sm">
          <p className="text-gray-600">
            {searchQuery.trim()
              ? "Nenhuma loja encontrada para essa busca. Tente outro termo."
              : "Nenhuma loja cadastrada ainda."}
          </p>
          {searchQuery.trim() && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-4 text-sm font-semibold text-primary hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
