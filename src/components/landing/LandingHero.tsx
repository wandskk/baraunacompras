import Link from "next/link";
import Image from "next/image";
import { Store, ArrowRight } from "lucide-react";
import { getPublicStores } from "@/lib/public-stores";
import { LojasCadastradasContent } from "./LojasCadastradasContent";

export async function LandingHero() {
  const stores = await getPublicStores();

  return (
    <section
      id="lojas-cadastradas"
      className="scroll-mt-20 relative flex min-h-screen flex-col justify-center overflow-hidden py-6 sm:py-8"
    >
      {/* Background com identidade */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-white to-primary/[0.03]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#2F8743_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col flex-start px-4 sm:px-6 lg:px-8">
        {/* Ícone + texto */}
        <div
          className="flex flex-col items-center justify-center gap-6 opacity-0 animate-hero-fade sm:flex-row sm:items-center sm:justify-center sm:gap-8"
          style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
        >
          <Image
            src="/logo-icon.png"
            alt="Baraúna Compras"
            width={112}
            height={112}
            className="h-16 w-16 object-contain drop-shadow-md sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            priority
          />
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl xl:text-5xl">
              Busque lojas em <span className="text-primary">Baraúna</span>
            </h1>
            <p className="mt-2 text-base font-medium text-gray-600 sm:text-lg lg:text-xl">
              Compras locais na palma da mão
            </p>
          </div>
        </div>

        {/* Busca - elemento central, direto ao ponto */}
        {stores.length > 0 ? (
          <div
            className="mt-4 opacity-0 animate-hero-scale"
            style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
          >
            <LojasCadastradasContent
              stores={stores}
              ctaSlot={
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                >
                  Quero cadastrar minha loja
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          </div>
        ) : (
          <div
            className="mt-6 rounded-2xl border-2 border-dashed border-navy/20 bg-white/80 p-8 text-center backdrop-blur-sm opacity-0 animate-hero-scale"
            style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Store className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-navy">
              Em breve: lojas da região
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Estamos preparando o marketplace. Cadastre sua loja e seja uma das
              primeiras a atender Baraúna online.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all hover:opacity-90"
            >
              Cadastrar minha loja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* CTA em destaque - desktop (no mobile aparece no hero via ctaSlot) */}
        <div
          className="mt-6 hidden justify-center opacity-0 animate-hero-fade md:flex"
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
      </div>
    </section>
  );
}
