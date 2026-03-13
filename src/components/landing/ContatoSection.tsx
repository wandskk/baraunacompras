"use client";

import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function ContatoSection() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    // Simular envio - em produção, integrar com API ou serviço de email
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  };

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

          <div className="rounded-2xl border border-[#202C59]/10 bg-gray-50/50 p-8">
            <h3 className="text-xl font-semibold text-[#202C59]">
              Envie sua mensagem
            </h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Input label="Nome" name="name" required placeholder="Seu nome" />
              <Input
                label="E-mail"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
              />
              <div>
                <label
                  htmlFor="message"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Como podemos ajudar?"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "sending" ? (
                  "Enviando..."
                ) : status === "sent" ? (
                  "Mensagem enviada!"
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar mensagem
                  </>
                )}
              </button>
            </form>
            <p className="mt-4 text-xs text-gray-500">
              * Em breve integraremos o envio automático. Por enquanto, use o
              e-mail acima.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
