"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { AuthCard } from "@/components/auth/AuthCard";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao fazer login");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Bem-vindo de volta"
      subtitle="Acesse sua conta para gerenciar suas lojas e pedidos."
      badge={{ icon: <LogIn className="h-4 w-4" />, label: "Entrar na plataforma" }}
      footerText="Não tem conta?"
      footerLinkText="Criar conta"
      footerLinkHref="/register"
      compact
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        <div className="space-y-3 sm:space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="seu@email.com"
          />
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <Link
                href="/#contato"
                className="text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Sua senha"
            />
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100"
            role="alert"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={loading}
          className="h-12 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
        >
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </AuthCard>
  );
}
