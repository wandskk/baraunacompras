"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button, Input } from "@/components/ui";
import { slugify } from "@/lib/slugify";
import { ArrowLeft, Store, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleTenantNameChange(value: string) {
    setTenantName(value);
    setTenantSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tenantRes = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tenantName, slug: tenantSlug }),
        credentials: "include",
      });
      const tenantData = await tenantRes.json();
      if (!tenantRes.ok) {
        setError(tenantData.error ?? "Erro ao criar organização");
        return;
      }
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          password,
          tenantId: tenantData.id,
        }),
        credentials: "include",
      });
      const userData = await registerRes.json();
      if (!registerRes.ok) {
        setError(userData.error ?? "Erro ao criar conta");
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
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#2266B0]/10 via-transparent to-transparent" />

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

        <div className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#2266B0]/10 px-4 py-2">
          <UserPlus className="h-4 w-4 text-[#2266B0]" />
          <span className="text-sm font-medium text-[#2266B0]">Criar conta</span>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-[#202C59]">Comece a vender</h1>
        <p className="mt-1 text-sm text-gray-600">
          Crie sua organização e cadastre sua loja na plataforma
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="rounded-lg border border-[#202C59]/10 bg-gray-50/50 p-3">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#202C59]">
              <Store className="h-4 w-4 text-[#2F8743]" />
              Sua organização
            </p>
            <div className="space-y-3">
              <Input
                label="Nome da organização"
                value={tenantName}
                onChange={(e) => handleTenantNameChange(e.target.value)}
                required
                placeholder="Minha Loja"
              />
              <Input
                label="Slug (URL da loja)"
                value={tenantSlug}
                onChange={(e) => setTenantSlug(e.target.value)}
                required
                placeholder="minha-loja"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#202C59]/10 bg-gray-50/50 p-3">
            <p className="mb-3 flex items-center gap-2 text-sm font-medium text-[#202C59]">
              <UserPlus className="h-4 w-4 text-[#2F8743]" />
              Seus dados
            </p>
            <div className="space-y-3">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Input
                label="Nome (opcional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>
          )}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-[#2F8743] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
