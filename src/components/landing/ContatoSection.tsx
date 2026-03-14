import { Mail, MapPin } from "lucide-react";
import { ContatoForm } from "./ContatoForm";

export function ContatoSection() {
  return (
    <section
      id="contato"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2266B0]/10 px-4 py-2 text-sm font-medium text-[#2266B0]">
              <Mail className="h-4 w-4" />
              Fale conosco
            </div>
            <h2 className="mt-6 text-3xl font-bold text-[#202C59] sm:text-4xl lg:text-5xl">
              Contato
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Tem dúvidas, sugestões ou quer cadastrar sua loja? Entre em contato
              conosco. Estamos à disposição para ajudar!
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2F8743]/10">
                  <MapPin className="h-6 w-6 text-[#2F8743]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#202C59]">Localização</h3>
                  <p className="text-gray-600">Baraúna, Rio Grande do Norte</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2266B0]/10">
                  <Mail className="h-6 w-6 text-[#2266B0]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#202C59]">E-mail</h3>
                  <a
                    href="mailto:contato@baraunacompras.com.br"
                    className="text-[#2F8743] hover:underline"
                  >
                    contato@baraunacompras.com.br
                  </a>
                </div>
              </div>
            </div>
          </div>

          <ContatoForm />
        </div>
      </div>
    </section>
  );
}
