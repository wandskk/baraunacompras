import { getPublicProducts } from "@/lib/public-products";
import { BuscarProdutosContent } from "./BuscarProdutosContent";

export async function BuscarProdutosSection() {
  const { products: initialProducts, pagination: initialPagination } =
    await getPublicProducts(undefined, 1, 12);

  return (
    <section
      id="buscar-produtos"
      className="scroll-mt-20 relative flex flex-col justify-center overflow-hidden py-6 sm:py-8 lg:py-12"
    >
      {/* Base gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20"
        aria-hidden
      />
      {/* Gradient orbs */}
      <div
        className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/25 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute -right-20 -bottom-20 h-[28rem] w-[28rem] rounded-full bg-primary/30 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      {/* Warm accent orb */}
      <div
        className="absolute right-1/4 top-1/4 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden
      />
      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.25] [background-image:radial-gradient(#2F8743_1.5px,transparent_1.5px)] [background-size:24px_24px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
        <div
          className="flex flex-col items-center justify-center text-center opacity-0 animate-hero-fade"
          style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
        >
          <h2 className="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl xl:text-5xl">
            Busque produtos em <span className="text-primary">Baraúna</span>
          </h2>
          <p className="mt-2 text-base font-medium text-gray-600 sm:text-lg lg:text-xl">
            Encontre o que precisa nas lojas locais
          </p>
        </div>

        <BuscarProdutosContent
          initialProducts={initialProducts}
          initialPagination={initialPagination}
        />
      </div>
    </section>
  );
}
