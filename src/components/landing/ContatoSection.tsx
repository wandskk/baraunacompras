import { Mail, MapPin, MessageCircle, Instagram } from "lucide-react";

const WHATSAPP_NUMBER = "5584994873510";
const INSTAGRAM_USER = "wandskk";

export function ContatoSection() {
  return (
    <section
      id="contato"
      className="scroll-mt-20 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
                  href="mailto:devwk.c@gmail.com"
                  className="text-[#2F8743] hover:underline"
                >
                  devwk.c@gmail.com
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={`https://instagram.com/${INSTAGRAM_USER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-[#f09433] via-[#e4405f] to-[#833ab4] px-5 py-3 font-medium text-white transition-opacity hover:opacity-90"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
