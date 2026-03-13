"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Store, ChevronRight, Search } from "lucide-react";
import type { PublicStoreItem } from "@/lib/public-stores";

type Props = {
  stores: PublicStoreItem[];
};

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function LojasCadastradasContent({ stores }: Props) {
  const [query, setQuery] = useState("");

  const filteredStores = useMemo(() => {
    if (!query.trim()) return stores;
    const q = normalize(query.trim());
    return stores.filter((item) => {
      const name = normalize(item.store.name);
      const tenant = normalize(item.tenantName);
      const desc = item.store.description
        ? normalize(item.store.description)
        : "";
      return name.includes(q) || tenant.includes(q) || desc.includes(q);
    });
  }, [stores, query]);

  return (
    <div className="mt-12">
      <div className="mx-auto max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome da loja..."
            className="w-full rounded-xl border border-[#202C59]/20 py-3 pl-11 pr-4 text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#2F8743] focus:ring-2 focus:ring-[#2F8743]/20"
            aria-label="Buscar lojas"
          />
        </div>
        {stores.length > 0 && (
          <p className="mt-2 text-center text-sm text-gray-500">
            {filteredStores.length === stores.length
              ? `${stores.length} loja${stores.length !== 1 ? "s" : ""} encontrada${stores.length !== 1 ? "s" : ""}`
              : `${filteredStores.length} de ${stores.length} loja${stores.length !== 1 ? "s" : ""}`}
          </p>
        )}
      </div>

      {filteredStores.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStores.map((item) => (
            <Link
              key={item.tenantSlug}
              href={`/loja/${item.tenantSlug}`}
              className="group flex items-center gap-4 rounded-2xl border border-[#202C59]/10 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:border-[#2F8743]/30 hover:shadow-lg sm:p-5"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#2F8743]/10 sm:h-16 sm:w-16">
                {item.store.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.store.logoUrl}
                    alt={item.store.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store className="h-7 w-7 text-[#2F8743] sm:h-8 sm:w-8" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-[#202C59] group-hover:text-[#2F8743]">
                  {item.store.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-sm text-gray-500">
                  {item.store.description ?? `Loja de ${item.tenantName}`}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F8743]/10 text-[#2F8743] transition-all group-hover:bg-[#2F8743] group-hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-[#202C59]/10 bg-gray-50/50 p-12 text-center">
          <p className="text-gray-600">
            {query.trim()
              ? "Nenhuma loja encontrada para essa busca. Tente outro termo."
              : "Nenhuma loja cadastrada ainda."}
          </p>
          {query.trim() && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-4 text-sm font-medium text-[#2F8743] hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </div>
  );
}
