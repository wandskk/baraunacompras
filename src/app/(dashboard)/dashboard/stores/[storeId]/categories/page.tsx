"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { getSession } from "@/lib/auth";

type Category = {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
};

export default function CategoriesPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const [session, setSession] = useState<ReturnType<typeof getSession>>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    if (!s) {
      router.replace("/login");
      return;
    }
    fetchCategories(s.tenantId);
  }, [router]);

  async function fetchCategories(tenantId: string) {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setError("");
    setCreateLoading(true);
    try {
      const res = await fetch(`/api/tenants/${session.tenantId}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, tenantId: session.tenantId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar categoria");
        return;
      }
      setCategories((prev) => [...prev, data]);
      setShowCreate(false);
      setName("");
      setSlug("");
    } catch {
      setError("Erro de conexão");
    } finally {
      setCreateLoading(false);
    }
  }

  if (loading || !session) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/stores/${storeId}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar à loja
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <Button onClick={() => setShowCreate(true)}>Nova categoria</Button>
      </div>
      {showCreate && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading ? "Criando..." : "Criar"}
              </Button>
            </div>
          </form>
        </div>
      )}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhuma categoria ainda.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.slug}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
