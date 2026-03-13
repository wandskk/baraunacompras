"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "@/components/ui";
import { ArrowLeft, LogIn } from "lucide-react";

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
    <div className="relative overflow-hidden rounded-2xl border border-[#202C59]/10 bg-white shadow-xl">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#2F8743]/10 via-transparent to-transparent" />

      <div className="relative p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#202C59] transition-colors hover:text-[#2F8743]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à página inicial
        </Link>

        <div className="mt-6 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Baraúna Compras"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
          <div className="mt-4 flex items-center gap-2 text-center">
            <span className="font-bold text-[#2F8743]">Baraúna</span>
            <span className="font-bold text-[#202C59]">Compras</span>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#2F8743]/10 px-4 py-2">
          <LogIn className="h-4 w-4 text-[#2F8743]" />
          <span className="text-sm font-medium text-[#2F8743]">Entrar na plataforma</span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#202C59]">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-gray-600">
          Acesse sua conta para gerenciar suas lojas e pedidos
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-[#2F8743] hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
