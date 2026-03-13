import Link from "next/link";
import Image from "next/image";
import { Store, ShoppingBag } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-[#FCD000]/5 to-[#2F8743]/10 py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#202C59]/20 bg-white/80 px-4 py-2 text-sm font-medium text-[#202C59] shadow-sm">
              <Store className="h-4 w-4 text-[#2F8743]" />
              Compras locais na palma da mão
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-[#202C59] sm:text-5xl lg:text-6xl">
              Conectando Baraúna ao{" "}
              <span className="text-[#2F8743]">comércio digital</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-600">
              Descubra as lojas da sua cidade, busque produtos e compre online.
              Uma plataforma feita para valorizar o comércio local de Baraúna.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="#lojas-cadastradas"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <ShoppingBag className="h-5 w-5" />
                Explorar lojas
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary px-6 py-3 font-medium text-primary transition-opacity hover:bg-primary/10"
              >
                Cadastrar minha loja
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="relative h-64 w-64 sm:h-80 sm:w-80 lg:h-96 lg:w-96">
              <Image
                src="/logo.png"
                alt="Baraúna Compras - Sacola de compras com cursor"
                fill
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
