import { getPublicProducts } from "@/lib/public-products";
import { BuscarProdutosContent } from "./BuscarProdutosContent";

export async function BuscarProdutosSection() {
  const { products: initialProducts, pagination: initialPagination } =
    await getPublicProducts(undefined, 1, 10);

  return (
    <section
      id="buscar-produtos"
      className="scroll-mt-20 relative flex min-h-screen flex-col justify-center overflow-hidden py-12 sm:py-16 lg:py-20"
    >
      {/* Background suave - identidade Baraúna */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-primary/[0.04] to-primary/[0.08]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#2F8743_1px,transparent_1px)] [background-size:20px_20px]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-4 sm:px-6 lg:px-8">
        {/* Título e proposta de valor claros */}
        <div
          className="flex flex-col items-center text-center opacity-0 animate-hero-fade"
          style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
        >
          <h1 className="text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl xl:text-[2.75rem]">
            Produtos e lojas em{" "}
            <span className="text-primary">Baraúna</span>
          </h1>
          <p className="mt-3 max-w-xl text-base font-medium text-gray-600 sm:text-lg">
            Busque o que precisa ou explore as lojas locais
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
