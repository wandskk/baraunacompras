"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FolderOpen, Plus } from "lucide-react";
import { Button, Input, Modal, PageLoadingOverlay } from "@/components/ui";
import {
  DataList,
  DataListItem,
  StoreListPageLayout,
} from "@/components/dashboard";
import { slugify } from "@/lib/slugify";
import { toast } from "@/lib/toast";
import { useSession } from "@/hooks/useSession";

type Category = {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
};

export default function CategoriesPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchCategories(session.tenantId);
    }
  }, [session]);

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
        const msg = data.error ?? "Erro ao criar categoria";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Categoria criada com sucesso");
      setCategories((prev) => [...prev, data]);
      setModalOpen(false);
      setName("");
      setSlug("");
    } catch {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setCreateLoading(false);
    }
  }

  if (sessionLoading || loading || !session) {
    return <PageLoadingOverlay show message="Carregando categorias..." />;
  }

  return (
    <StoreListPageLayout
      storeId={storeId}
      title="Categorias"
      actions={
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      }
    >
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError("");
        }}
        title="Nova categoria"
      >
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
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createLoading}>
              {createLoading ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </Modal>

      <DataList
        empty={categories.length === 0}
        emptyMessage="Nenhuma categoria cadastrada."
        emptyIcon={FolderOpen}
        emptyAction={
          !modalOpen && (
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar primeira categoria
            </Button>
          )
        }
      >
        {categories.map((cat) => (
          <DataListItem key={cat.id}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{cat.name}</p>
                <p className="text-sm text-gray-500">/{cat.slug}</p>
              </div>
            </div>
          </DataListItem>
        ))}
      </DataList>
    </StoreListPageLayout>
  );
}
