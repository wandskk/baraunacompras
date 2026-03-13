"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, ImageUpload, Modal } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  description?: string | null;
  imageUrl?: string | null;
  stock?: number;
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(page));
    params.set("limit", "10");
    Promise.all([
      fetch(`/api/tenants/${session.tenantId}/stores/${storeId}/products?${params}`),
      fetch(`/api/tenants/${session.tenantId}/categories`),
    ])
      .then(async ([productsRes, categoriesRes]) => {
        if (productsRes.ok) {
          const json = await productsRes.json();
          setProducts(json.products ?? json);
          setPagination(json.pagination ?? null);
        }
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      })
      .finally(() => setLoading(false));
  }, [storeId, session, search, page]);

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function openCreateModal() {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setStock("0");
    setCategoryId("");
    setError("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setName(product.name);
    setSlug(product.slug);
    setDescription(product.description ?? "");
    setImageUrl(product.imageUrl ?? "");
    setPrice(product.price);
    setStock(String(product.stock ?? 0));
    setCategoryId(product.categoryId ?? "");
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingProduct(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setError("");
    setSubmitLoading(true);
    try {
      const body = {
        name,
        slug,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        categoryId: categoryId || undefined,
      };

      const url = editingProduct
        ? `/api/tenants/${session.tenantId}/stores/${storeId}/products/${editingProduct.id}`
        : `/api/tenants/${session.tenantId}/stores/${storeId}/products`;

      const res = await fetch(url, {
        method: editingProduct ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? (editingProduct ? "Erro ao atualizar" : "Erro ao criar produto"));
        return;
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? { ...data, stock: data.stock ?? 0 } : p
          )
        );
      } else {
        setProducts((prev) => [...prev, { ...data, stock: data.stock ?? 0 }]);
      }
      closeModal();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSubmitLoading(false);
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <div className="flex gap-2">
          <input
            type="search"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setPage(1)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <Button onClick={openCreateModal}>Novo produto</Button>
        </div>
      </div>
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {session && (
              <ImageUpload
                label="Imagem do produto"
                value={imageUrl}
                onChange={setImageUrl}
                tenantId={session.tenantId}
                placeholder="Enviar imagem"
              />
            )}
            <Input
              label="Preço"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Estoque"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
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
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading
                  ? editingProduct
                    ? "Salvando..."
                    : "Criando..."
                  : editingProduct
                    ? "Salvar"
                    : "Criar"}
              </Button>
            </div>
          </form>
      </Modal>
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
                <div className="flex items-center gap-4">
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-500">
                      {p.slug} {p.stock !== undefined && `• Estoque: ${p.stock}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium text-primary">
                    R$ {Number(p.price).toFixed(2)}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => openEditModal(p)}
                  >
                    Editar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {pagination && pagination.total > pagination.limit && (
        <div className="mt-4 flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Página {page} de {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <Button
            variant="outline"
            disabled={page * pagination.limit >= pagination.total}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
