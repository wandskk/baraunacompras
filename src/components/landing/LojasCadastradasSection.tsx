import Link from "next/link";
import { Store, ArrowRight, ShoppingBag, Shield, Zap } from "lucide-react";
import { getPublicStores } from "@/lib/public-stores";
import { LojasCadastradasContent } from "./LojasCadastradasContent";

const benefits = [
  {
    icon: ShoppingBag,
    title: "Variedade",
    desc: "Diversos segmentos para você encontrar o que precisa.",
  },
  {
    icon: Shield,
    title: "Confiança",
    desc: "Lojas locais verificadas, com entrega na sua região.",
  },
  {
    icon: Zap,
    title: "Praticidade",
    desc: "Navegue, compare e compre no conforto de casa.",
  },
] as const;

export async function LojasCadastradasSection() {
  const stores = await getPublicStores();

  return (
    <section
      id="lojas-cadastradas"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2F8743]/10 px-4 py-2 text-sm font-medium text-[#2F8743]">
            <Store className="h-4 w-4" />
            Marketplace local
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#202C59] sm:text-4xl lg:text-5xl">
            Lojas cadastradas
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Conheça as lojas de Baraúna que já fazem parte da plataforma e
            atendem você online.
          </p>
        </div>

        {/* Benefits pills */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex items-center gap-2 rounded-full border border-[#202C59]/10 bg-gray-50/80 px-4 py-2 text-sm text-gray-700"
            >
              <b.icon className="h-4 w-4 text-[#2F8743]" />
              <span className="font-medium">{b.title}</span>
            </div>
          ))}
        </div>

        {/* Search + Store cards grid */}
        {stores.length > 0 ? (
          <LojasCadastradasContent stores={stores} />
        ) : (
          <div className="mt-12 rounded-2xl border-2 border-dashed border-[#202C59]/20 bg-[#2F8743]/5 p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2F8743]/10">
              <Store className="h-8 w-8 text-[#2F8743]" />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-[#202C59]">
              Em breve: lojas da região
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Estamos preparando o marketplace. Cadastre sua loja e seja uma das
              primeiras a atender Baraúna online.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Cadastrar minha loja
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* CTAs */}
        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
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
