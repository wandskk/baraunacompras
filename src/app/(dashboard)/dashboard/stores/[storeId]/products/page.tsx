"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  ShoppingBag,
  AlertTriangle,
  Package,
  DollarSign,
  Layers,
} from "lucide-react";
import {
  Button,
  Input,
  ImageUpload,
  LoadingSpinner,
  MaskedInput,
  Modal,
} from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { formatNumberToCurrency, parseCurrencyToNumber } from "@/lib/masks";
import {
  DataList,
  DataListItem,
  OptionListField,
  StoreListPageLayout,
} from "@/components/dashboard";
import { slugify } from "@/lib/slugify";
import { useSession } from "@/hooks/useSession";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: string;
  description?: string | null;
  imageUrl?: string | null;
  stock?: number;
  minStock?: number;
  variations?: string[];
  sizes?: string[];
  categoryId: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const initialLowStock = searchParams.get("lowStock") === "true";
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("0");
  const [minStock, setMinStock] = useState("0");
  const [variations, setVariations] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(initialLowStock);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setLowStockFilter(searchParams.get("lowStock") === "true");
  }, [searchParams]);

  useEffect(() => {
    if (!session) return;
    const qs = new URLSearchParams();
    if (search) qs.set("q", search);
    if (lowStockFilter) qs.set("lowStock", "true");
    qs.set("page", String(page));
    qs.set("limit", "10");
    Promise.all([
      fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}/products?${qs}`,
      ),
      fetch(`/api/tenants/${session.tenantId}/categories`),
      fetch(`/api/tenants/${session.tenantId}/stores/${storeId}`),
    ])
      .then(async ([productsRes, categoriesRes, storeRes]) => {
        if (productsRes.ok) {
          const json = await productsRes.json();
          setProducts(json.products ?? json);
          setPagination(json.pagination ?? null);
        }
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (storeRes.ok) {
          const store = await storeRes.json();
          setTenantSlug(store?.tenant?.slug ?? null);
        }
      })
      .finally(() => setLoading(false));
  }, [storeId, session, search, page, lowStockFilter]);

  function openCreateModal() {
    setEditingProduct(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setPrice("");
    setStock("0");
    setMinStock("0");
    setVariations([]);
    setSizes([]);
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
    setPrice(product.price ? formatNumberToCurrency(Number(product.price)) : "");
    setStock(String(product.stock ?? 0));
    setMinStock(String(product.minStock ?? 0));
    setVariations(product.variations ?? []);
    setSizes(product.sizes ?? []);
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
        price: parseCurrencyToNumber(price) || parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        minStock: parseInt(minStock, 10) || 0,
        variations: variations.length > 0 ? variations : undefined,
        sizes: sizes.length > 0 ? sizes : undefined,
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
        setError(
          data.error ??
            (editingProduct ? "Erro ao atualizar" : "Erro ao criar produto"),
        );
        return;
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? { ...data, stock: data.stock ?? 0, minStock: data.minStock ?? 0 }
              : p,
          ),
        );
      } else {
        setProducts((prev) => [
          ...prev,
          { ...data, stock: data.stock ?? 0, minStock: data.minStock ?? 0 },
        ]);
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
      <LoadingSpinner message="Carregando produtos..." minHeight="200px" />
    );
  }

  return (
    <StoreListPageLayout
      storeId={storeId}
      title="Produtos"
      actions={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setPage(1)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-56"
            />
          </div>
          <Button
            variant={lowStockFilter ? "primary" : "outline"}
            onClick={() => {
              const next = !lowStockFilter;
              setLowStockFilter(next);
              setPage(1);
              const qs = new URLSearchParams(searchParams.toString());
              if (next) qs.set("lowStock", "true");
              else qs.delete("lowStock");
              router.replace(`?${qs.toString()}`, { scroll: false });
            }}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            Estoque baixo
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo produto
          </Button>
        </div>
      }
    >
      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingProduct ? "Editar produto" : "Novo produto"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Package className="h-5 w-5 text-primary" />
              Informações básicas
            </h3>
            <div className="space-y-4">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
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
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <DollarSign className="h-5 w-5 text-primary" />
              Preço e estoque
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <MaskedInput
                label="Preço"
                mask="currency"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                required
              />
              <Input
                label="Estoque"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <Input
                label="Estoque mínimo"
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                placeholder="0"
                title="Alerta quando estoque ficar abaixo deste valor"
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
              <Layers className="h-5 w-5 text-primary" />
              Variações e categoria
            </h3>
            <div className="space-y-4">
              <OptionListField
                label="Variações"
                activateLabel="Ativar variações"
                options={variations}
                onChange={setVariations}
                placeholder="Ex: Vermelho, Azul"
              />
              <OptionListField
                label="Tamanhos"
                activateLabel="Ativar tamanhos"
                options={sizes}
                onChange={setSizes}
                placeholder="Ex: P, M, G"
              />
              <div className="w-full">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Categoria
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Nenhuma</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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

      <DataList
        empty={products.length === 0}
        emptyMessage="Nenhum produto cadastrado."
        emptyIcon={ShoppingBag}
        emptyAction={
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar primeiro produto
          </Button>
        }
      >
        {products.map((p) => (
          <DataListItem
            key={p.id}
            href={
              tenantSlug
                ? `/loja/${tenantSlug}/produtos/${p.slug}`
                : undefined
            }
          >
            <div className="flex items-center gap-4">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-500">
                  /{p.slug}
                  {p.stock !== undefined && (
                    <span className="text-gray-400">
                      {" "}
                      • Estoque: {p.stock}
                      {p.minStock != null &&
                        p.minStock > 0 &&
                        p.stock < p.minStock && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                            <AlertTriangle className="h-3 w-3" />
                            Baixo
                          </span>
                        )}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-primary">
                {formatCurrency(Number(p.price))}
              </p>
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openEditModal(p);
                }}
                className="gap-1.5"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
            </div>
          </DataListItem>
        ))}
      </DataList>

      {pagination && pagination.total > pagination.limit && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </Button>
          <span className="px-4 py-2 text-sm text-gray-600">
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
    </StoreListPageLayout>
  );
}
