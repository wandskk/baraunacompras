"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { slugify } from "@/lib/slugify";

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
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-gray-900">Criar conta</h1>
      <p className="mt-1 text-sm text-gray-500">
        Crie sua organização e comece a vender
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Nome da organização"
          value={tenantName}
          onChange={(e) => handleTenantNameChange(e.target.value)}
          required
          placeholder="Minha Loja"
        />
        <Input
          label="Slug da organização"
          value={tenantSlug}
          onChange={(e) => setTenantSlug(e.target.value)}
          required
          placeholder="minha-loja"
        />
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
        {error && (
          <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Criando..." : "Criar conta"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
