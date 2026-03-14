"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#lojas-cadastradas", label: "Lojas Cadastradas" },
  { href: "#buscar-produtos", label: "Buscar Produtos" },
  { href: "#quem-somos", label: "Quem Somos" },
  { href: "#contato", label: "Contato" },
];

const btnOutline =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border-2 border-primary px-4 text-sm font-medium text-primary transition-opacity hover:bg-primary/10";
const btnPrimary =
  "inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border-2 border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90";

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#202C59]/10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 min-h-0 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex shrink-0 items-center transition-opacity hover:opacity-90"
        >
          <Image
            src="/logo-nova.png"
            alt="Baraúna Compras"
            width={160}
            height={48}
            className="h-9 w-auto object-contain sm:h-10 lg:h-11"
            priority
          />
        </Link>

        <nav className="hidden shrink-0 items-center gap-3 lg:flex xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-sm font-medium text-[#202C59] transition-colors hover:text-[#2F8743] xl:text-base"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 lg:flex xl:gap-3">
          <Link href="/login" className={btnOutline}>
            Entrar
          </Link>
          <Link href="/register" className={btnPrimary}>
            Criar conta
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="shrink-0 rounded-lg p-2 text-[#202C59] lg:hidden"
          aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#202C59]/10 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-[#202C59] hover:bg-[#2F8743]/10"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2 border-t border-[#202C59]/10 pt-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className={`${btnOutline} w-full`}
              >
                Entrar
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className={`${btnPrimary} w-full`}
              >
                Criar conta
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
