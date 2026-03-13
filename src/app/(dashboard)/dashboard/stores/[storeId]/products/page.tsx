"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      fetch(`/api/tenants/${session.tenantId}/stores/${storeId}/products`),
      fetch(`/api/tenants/${session.tenantId}/categories`),
    ])
      .then(async ([productsRes, categoriesRes]) => {
        if (productsRes.ok) setProducts(await productsRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      })
      .finally(() => setLoading(false));
  }, [storeId, session]);

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
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}/products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            slug,
            price: parseFloat(price),
            categoryId: categoryId || undefined,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao criar produto");
        return;
      }
      setProducts((prev) => [...prev, data]);
      setShowCreate(false);
      setName("");
      setSlug("");
      setPrice("");
      setCategoryId("");
    } catch {
      setError("Erro de conexão");
    } finally {
      setCreateLoading(false);
    }
  }

  if (sessionLoading || loading || !session) {
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
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <Button onClick={() => setShowCreate(true)}>Novo produto</Button>
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
            <Input
              label="Preço"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Categoria
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Nenhuma</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
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
        {products.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum produto ainda.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between px-6 py-4"
              >
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-500">{p.slug}</p>
                </div>
                <p className="font-medium text-primary">
                  R$ {Number(p.price).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
