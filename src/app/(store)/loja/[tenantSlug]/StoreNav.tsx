"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  tenantSlug: string;
  storeName: string;
  storeId: string;
  isStoreOwner?: boolean;
};

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function StoreNav({
  tenantSlug,
  storeName,
  storeId,
  isStoreOwner,
}: Props) {
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchCartCount = useCallback(() => {
    fetch(`/api/public/${tenantSlug}/cart`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((data) => {
        const count = (data.items ?? []).reduce(
          (s: number, i: { quantity?: number }) => s + (i.quantity ?? 1),
          0,
        );
        setCartCount(count);
      })
      .catch(() => {});
  }, [tenantSlug]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  useEffect(() => {
    const handler = () => fetchCartCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [fetchCartCount]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery("");
    if (q) {
      router.push(`/loja/${tenantSlug}?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/loja/${tenantSlug}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo + Store name */}
        <Link
          href={`/loja/${tenantSlug}`}
          className="flex min-w-0 shrink items-center gap-2 transition-opacity hover:opacity-90"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
            {storeName.charAt(0)}
          </span>
          <span className="truncate text-lg font-bold text-primary">
            {storeName}
          </span>
        </Link>

        {/* Desktop: Search + Cart */}
        <div className="hidden items-center gap-2 sm:flex sm:gap-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 rounded-lg border border-gray-200 bg-gray-50/80 py-2 pl-9 pr-3 text-sm focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 lg:w-56"
            />
          </form>
          <Link
            href={`/loja/${tenantSlug}/carrinho`}
            className="relative flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label={`Carrinho${cartCount > 0 ? ` com ${cartCount} itens` : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          {isStoreOwner && (
            <Link
              href={`/dashboard/stores/${storeId}`}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Mobile: Search icon + Cart icon */}
        <div className="flex items-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Buscar"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <Link
            href={`/loja/${tenantSlug}/carrinho`}
            className="relative flex items-center justify-center rounded-lg p-2.5 text-gray-600 transition-colors hover:bg-gray-100"
            aria-label={`Carrinho${cartCount > 0 ? ` com ${cartCount} itens` : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-lg p-2.5 text-gray-600 hover:bg-gray-100"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && (
        <div className="border-t border-gray-100 bg-white p-4 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          className="border-t border-gray-100 bg-white p-4 sm:hidden"
          aria-label="Menu mobile"
        >
          <div className="flex flex-col gap-1">
            <Link
              href={`/loja/${tenantSlug}`}
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              href={`/loja/${tenantSlug}/carrinho`}
              className="rounded-lg px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              Carrinho
            </Link>
            {isStoreOwner && (
              <Link
                href={`/dashboard/stores/${storeId}`}
                className="rounded-lg px-4 py-2 font-medium text-primary hover:bg-primary/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
