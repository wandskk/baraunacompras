"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

type Store = {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  tenant?: { slug: string };
};

type StatsByStore = Record<
  string,
  { pendingOrders: number; revenueThisMonth: number; lowStockCount: number }
>;

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading: sessionLoading, logout } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [statsByStore, setStatsByStore] = useState<StatsByStore>({});
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    if (!sessionLoading && session) {
      fetchStores(session.tenantId);
    }
  }, [session, sessionLoading]);

  async function fetchStores(tenantId: string) {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/dashboard-summary`);
      if (res.ok) {
        const data = await res.json();
        setStores(data.stores ?? data);
        setStatsByStore(data.statsByStore ?? {});
      } else {
        const fallback = await fetch(`/api/tenants/${tenantId}/stores`);
        if (fallback.ok) setStores(await fallback.json());
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function handleNameChange(value: string) {
    setNewName(value);
    setNewSlug(slugify(value));
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setCreateError("");
    setCreateLoading(true);
    try {
      const res = await fetch(`/api/tenants/${session.tenantId}/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error ?? "Erro ao criar loja");
        return;
      }
      setStores((prev) => [...prev, data]);
      setStatsByStore((prev) => ({
        ...prev,
        [data.id]: {
          pendingOrders: 0,
          revenueThisMonth: 0,
          lowStockCount: 0,
        },
      }));
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
    } catch {
      setCreateError("Erro de conexão");
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Lojas</h1>
          <p className="mt-1 text-sm text-gray-500">
            {session.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
          <Button onClick={() => setShowCreate(true)}>Nova loja</Button>
        </div>
      </div>
      {showCreate && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Criar loja</h2>
          <form onSubmit={handleCreateStore} className="mt-4 space-y-4">
            <Input
              label="Nome da loja"
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Minha Loja"
            />
            <Input
              label="Slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              required
              placeholder="minha-loja"
            />
            {createError && (
              <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {createError}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreate(false);
                  setCreateError("");
                }}
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
      {stores.length === 0 && !showCreate ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">Nenhuma loja ainda.</p>
          <Button
            className="mt-4"
            onClick={() => setShowCreate(true)}
          >
            Criar primeira loja
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Link href={`/dashboard/stores/${store.id}`}>
                <h3 className="font-semibold text-gray-900">{store.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{store.slug}</p>
              </Link>
              {statsByStore[store.id] && (
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <span className="text-gray-600">
                    <strong className="text-primary">
                      {statsByStore[store.id].pendingOrders}
                    </strong>{" "}
                    pedidos pendentes
                  </span>
                  <span className="text-gray-600">
                    R${" "}
                    <strong>
                      {statsByStore[store.id].revenueThisMonth.toFixed(2)}
                    </strong>{" "}
                    este mês
                  </span>
                  {statsByStore[store.id].lowStockCount > 0 && (
                    <span className="text-amber-600">
                      <strong>{statsByStore[store.id].lowStockCount}</strong> com
                      baixo estoque
                    </span>
                  )}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/dashboard/stores/${store.id}`}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Gerenciar →
                </Link>
                {statsByStore[store.id]?.pendingOrders > 0 && (
                  <Link
                    href={`/dashboard/stores/${store.id}/orders`}
                    className="text-sm font-medium text-amber-600 hover:underline"
                  >
                    Ver {statsByStore[store.id].pendingOrders} pedido(s) →
                  </Link>
                )}
                {store.tenant && (
                  <a
                    href={`/loja/${store.tenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Ver loja ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
