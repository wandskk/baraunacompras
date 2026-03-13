"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  TrendingUp,
  AlertTriangle,
  Store,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Button, Input, LoadingSpinner, Modal } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { slugify } from "@/lib/slugify";
import { toast } from "@/lib/toast";
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
  const { session, loading: sessionLoading } = useSession();
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
        const msg = data.error ?? "Erro ao criar loja";
        setCreateError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Loja criada com sucesso");
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
      toast.error("Erro de conexão");
    } finally {
      setCreateLoading(false);
    }
  }

  if (sessionLoading || loading || !session) {
    return <LoadingSpinner message="Carregando suas lojas..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Minhas Lojas
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            {session.email}
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Nova loja
        </Button>
      </div>

      {/* Modal Criar Loja */}
      <Modal
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setCreateError("");
        }}
        title="Criar nova loja"
      >
        <form onSubmit={handleCreateStore} className="space-y-4">
          <Input
            label="Nome da loja"
            value={newName}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            placeholder="Ex: Minha Loja Online"
          />
          <Input
            label="Slug (URL)"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            required
            placeholder="minha-loja-online"
          />
          <p className="text-xs text-gray-500">
            O slug será usado na URL da sua loja (ex: /loja/minha-loja-online)
          </p>
          {createError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {createError}
            </p>
          )}
          <div className="flex gap-2 pt-2">
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
              {createLoading ? "Criando..." : "Criar loja"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Conteúdo principal */}
      {stores.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              <Store className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Nenhuma loja cadastrada
            </h2>
            <p className="mt-2 text-gray-500">
              Comece criando sua primeira loja para gerenciar produtos, pedidos
              e muito mais.
            </p>
            <Button
              className="mt-6 gap-2"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-5 w-5" />
              Criar primeira loja
            </Button>
          </div>
        </div>
      ) : (
        /* Grid de Lojas */
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => {
            const stats = statsByStore[store.id];
            return (
              <div
                key={store.id}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md"
              >
                <Link href={`/dashboard/stores/${store.id}`} className="block">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900">
                          {store.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                          /{store.slug}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        Ativa
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="space-y-3 p-6 pt-4">
                  {/* Métricas */}
                  {stats && (
                    <div className="space-y-3">
                      {/* Pedidos pendentes */}
                      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                            <Package className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Pedidos pendentes
                            </p>
                            <p className="text-xs text-gray-500">
                              Aguardando processamento
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-amber-700">
                          {stats.pendingOrders}
                        </span>
                      </div>

                      {/* Receita do mês */}
                      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Receita do mês
                            </p>
                            <p className="text-xs text-gray-500">
                              Total acumulado
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-emerald-700">
                          {formatCurrency(stats.revenueThisMonth)}
                        </span>
                      </div>

                      {/* Estoque baixo */}
                      {stats.lowStockCount > 0 && (
                        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/80 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Estoque baixo
                              </p>
                              <p className="text-xs text-gray-500">
                                Produtos com alerta
                              </p>
                            </div>
                          </div>
                          <span className="text-xl font-bold text-red-700">
                            {stats.lowStockCount}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Link
                      href={`/dashboard/stores/${store.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                    >
                      Gerenciar
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                    {stats?.pendingOrders > 0 && (
                      <Link
                        href={`/dashboard/stores/${store.id}/orders`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
                      >
                        Ver {stats.pendingOrders} pedido(s)
                      </Link>
                    )}
                    {store.tenant && (
                      <a
                        href={`/loja/${store.tenant.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700"
                      >
                        Ver loja
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
