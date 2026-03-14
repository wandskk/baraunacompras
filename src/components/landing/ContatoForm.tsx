"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function ContatoForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
    }, 1000);
  };

  return (
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
        * Em breve integraremos o envio automático. Por enquanto, use o e-mail
        acima.
      </p>
    </div>
  );
}
