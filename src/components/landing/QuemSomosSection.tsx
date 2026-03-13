import { Heart, Users, MapPin } from "lucide-react";

export function QuemSomosSection() {
  return (
    <section
      id="quem-somos"
      className="scroll-mt-20 bg-gradient-to-br from-[#202C59]/5 to-[#2F8743]/10 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#2F8743]/10 px-4 py-2 text-sm font-medium text-[#2F8743]">
            <Heart className="h-4 w-4" />
            Sobre nós
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#202C59] sm:text-4xl lg:text-5xl">
            Quem somos
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            O <strong className="text-[#2F8743]">Baraúna Compras</strong> nasceu
            do desejo de fortalecer o comércio local da nossa cidade. Somos uma
            plataforma que conecta lojistas e consumidores, facilitando compras
            online com entrega na região.
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2F8743]/10">
              <MapPin className="h-7 w-7 text-[#2F8743]" />
            </div>
            <h3 className="text-xl font-semibold text-[#202C59]">
              100% Local
            </h3>
            <p className="mt-2 text-gray-600">
              Focado em Baraúna, valorizamos o comércio da nossa cidade e
              região.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#2266B0]/10">
              <Users className="h-7 w-7 text-[#2266B0]" />
            </div>
            <h3 className="text-xl font-semibold text-[#202C59]">
              Para lojistas e clientes
            </h3>
            <p className="mt-2 text-gray-600">
              Lojas montam a vitrine; clientes encontram o que precisam com
              praticidade.
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FCD000]/30">
              <Heart className="h-7 w-7 text-[#202C59]" />
            </div>
            <h3 className="text-xl font-semibold text-[#202C59]">
              Feito com carinho
            </h3>
            <p className="mt-2 text-gray-600">
              Desenvolvido para a comunidade de Baraúna, com as cores da nossa
              bandeira.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
