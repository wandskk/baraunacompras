import { getPublicProducts } from "@/lib/public-products";
import { BuscarProdutosContent } from "./BuscarProdutosContent";

export async function BuscarProdutosSection() {
  const initialProducts = await getPublicProducts();

  return (
    <section
      id="buscar-produtos"
      className="scroll-mt-20 relative flex flex-col justify-center overflow-hidden py-6 sm:py-8 lg:py-12"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-white via-white to-primary/[0.03]"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(#2F8743_1px,transparent_1px)] [background-size:20px_20px]"
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

        <BuscarProdutosContent initialProducts={initialProducts} />
      </div>
    </section>
  );
}
