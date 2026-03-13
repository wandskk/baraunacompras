"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { getSession } from "@/lib/auth";

type Store = {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  tenant?: { slug: string };
};

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) {
      router.replace("/login");
      return;
    }
    fetchStore(s.tenantId);
  }, [storeId, router]);

  async function fetchStore(tenantId: string) {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/stores/${storeId}`);
      if (!res.ok) {
        setStore(null);
        return;
      }
      const data = await res.json();
      setStore(data);
      setName(data.name);
      setSlug(data.slug);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !store) return;
    setError("");
    setSaveLoading(true);
    try {
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }
      setStore(data);
      setEditing(false);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Loja não encontrada.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-primary hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar às lojas
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            {error && (
              <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={saveLoading}>
              {saveLoading ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-2">
            <p>
              <span className="font-medium text-gray-500">Slug:</span> {store.slug}
            </p>
            {store.tenant && (
              <a
                href={`/loja/${store.tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-medium text-primary hover:underline"
              >
                Ver loja →
              </a>
            )}
            <div className="mt-6 flex gap-2">
              <Link href={`/dashboard/stores/${storeId}/categories`}>
                <Button variant="secondary">Categorias</Button>
              </Link>
              <Link href={`/dashboard/stores/${storeId}/products`}>
                <Button variant="secondary">Produtos</Button>
              </Link>
              <Link href={`/dashboard/stores/${storeId}/orders`}>
                <Button variant="secondary">Pedidos</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
