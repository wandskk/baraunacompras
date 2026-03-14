"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  MoreVertical,
  MapPin,
  Store,
  ExternalLink,
  Check,
  Truck,
  Package,
  X,
  MessageCircle,
  Search,
} from "lucide-react";
import Link from "next/link";
import { PageLoadingOverlay } from "@/components/ui";
import {
  DataList,
  StoreListPageLayout,
} from "@/components/dashboard";
import { formatCurrency, formatPhone } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/payment-labels";
import { useSession } from "@/hooks/useSession";
import { toast } from "@/lib/toast";
import {
  startGlobalActionLoading,
  endGlobalActionLoading,
} from "@/components/GlobalActionLoader";

type OrderItem = {
  id: string;
  quantity: number;
  price: string;
  product: { name: string };
};

type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  paymentMethod?: string | null;
  deliveryType?: string;
  deliveryStreet?: string | null;
  deliveryNumber?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryZipCode?: string | null;
  store?: { name: string };
  customer: { name: string | null; email: string; phone?: string | null } | null;
  _count?: { items: number };
  items?: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

function OrderRowSkeleton() {
  return (
    <li className="flex flex-col gap-3 px-6 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-start gap-4 sm:shrink-0">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-200" />
            <div className="min-w-0 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
        <div className="h-8 w-8 shrink-0 animate-pulse rounded bg-gray-100" />
      </div>
    </li>
  );
}

function getDeliveryLabel(order: Order): { type: "entrega" | "retirada"; detail?: string } {
  if (order.deliveryType === "delivery" && (order.deliveryCity || order.deliveryStreet)) {
    const detail =
      order.deliveryCity && order.deliveryState
        ? `${order.deliveryCity}-${order.deliveryState}`
        : order.deliveryStreet?.slice(0, 30);
    return { type: "entrega", detail };
  }
  return { type: "retirada" };
}

function OrderRowDropdown({
  order,
  storeId,
  tenantId,
  onStatusChange,
}: {
  order: Order;
  storeId: string;
  tenantId: string;
  onStatusChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuRect({ top: rect.bottom + 4, left: rect.right - 180 });
    } else {
      setMenuRect(null);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        open &&
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  async function handleAction(newStatus: string) {
    setOpen(false);
    startGlobalActionLoading();
    try {
      const res = await fetch(
        `/api/tenants/${tenantId}/stores/${storeId}/orders/${order.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        toast.success(`Status: ${STATUS_LABELS[newStatus] ?? newStatus}`);
        onStatusChange();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao atualizar");
      }
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      endGlobalActionLoading();
    }
  }

  const canChangeStatus = order.status !== "cancelled" && order.status !== "delivered";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        aria-label="Ações"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open &&
        menuRect &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] min-w-[180px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            style={{ top: menuRect.top, left: menuRect.left }}
          >
            <Link
              href={`/dashboard/stores/${storeId}/orders/${order.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-4 w-4" />
              Ver pedido completo
            </Link>
            {canChangeStatus && (
              <>
                <div className="my-1 border-t border-gray-100" />
                {order.status === "pending" && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleAction("confirmed")}
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                    Confirmar
                  </button>
                )}
                {order.status === "confirmed" && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleAction("shipped")}
                  >
                    <Truck className="h-4 w-4 text-indigo-600" />
                    Marcar enviado
                  </button>
                )}
                {order.status === "shipped" && (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => handleAction("delivered")}
                  >
                    <Package className="h-4 w-4 text-blue-600" />
                    Marcar entregue
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleAction("cancelled")}
                >
                  <X className="h-4 w-4" />
                  Cancelar pedido
                </button>
              </>
            )}
          </div>,
          document.body
        )}
    </>
  );
}

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const ORDER_OPTIONS: { value: "asc" | "desc"; label: string }[] = [
  { value: "desc", label: "Mais recentes primeiro" },
  { value: "asc", label: "Mais antigos primeiro" },
];

export default function OrdersPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const router = useRouter();
  const pathname = usePathname();
  const statusFilter = searchParams.get("status") || "";
  const orderFilter = (searchParams.get("order") === "asc" ? "asc" : "desc") as "asc" | "desc";
  const searchQuery = searchParams.get("q") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const [searchInput, setSearchInput] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  const setUrlParamsInternal = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const MIN_SEARCH_LENGTH = 3;

  const setSearch = useCallback(
    (q: string) => {
      setSearchInput(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        const trimmed = q.trim();
        if (trimmed.length >= MIN_SEARCH_LENGTH || trimmed.length === 0) {
          setUrlParamsInternal({ q: trimmed || "", page: "1" });
        }
      }, 400);
    },
    [setUrlParamsInternal]
  );

  const setFilter = useCallback(
    (key: "status" | "order", value: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.set("page", "1");
      const qs = next.toString();
      router.replace(`${pathname}?${qs}`);
    },
    [router, pathname, searchParams]
  );

  const setPage = useCallback(
    (p: number) => {
      setUrlParamsInternal({ page: String(p) });
    },
    [setUrlParamsInternal]
  );

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    const url = new URL(`/api/tenants/${session.tenantId}/stores/${storeId}/orders`, window.location.origin);
    if (statusFilter && VALID_STATUSES.includes(statusFilter)) url.searchParams.set("status", statusFilter);
    url.searchParams.set("order", orderFilter);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "10");
    if (searchQuery.trim().length >= MIN_SEARCH_LENGTH) url.searchParams.set("q", searchQuery.trim());
    fetch(url.toString())
      .then((res) => (res.ok ? res.json() : { orders: [], pagination: { page: 1, limit: 10, total: 0 } }))
      .then((data: { orders?: Order[]; pagination?: { page: number; limit: number; total: number } }) => {
        setOrders(data.orders ?? []);
        setPagination(data.pagination ?? null);
      })
      .finally(() => setLoading(false));
  }, [storeId, session, refresh, statusFilter, orderFilter, page, searchQuery]);

  if (sessionLoading || !session) {
    return <PageLoadingOverlay show message="Carregando pedidos..." />;
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

  return (
    <StoreListPageLayout storeId={storeId} title="Pedidos">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] sm:max-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Código ou nome do cliente (mín. 3 caracteres)..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = searchInput.trim();
                if (trimmed.length >= MIN_SEARCH_LENGTH || trimmed.length === 0) {
                  if (debounceRef.current) {
                    clearTimeout(debounceRef.current);
                    debounceRef.current = null;
                  }
                  setUrlParamsInternal({ q: trimmed || "", page: "1" });
                }
              }
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
            aria-label="Buscar por código ou cliente"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setFilter("status", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Filtrar por status"
        >
          <option value="">Todos os status</option>
          {VALID_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <select
          value={orderFilter}
          onChange={(e) => setFilter("order", e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Ordenar por data"
        >
          {ORDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {pagination && pagination.total > 0 && (
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] px-2 text-center text-sm text-gray-600">
              {page}
            </span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <DataList
        empty={!loading && orders.length === 0}
        emptyMessage="Nenhum pedido registrado."
        emptyIcon={ClipboardList}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <OrderRowSkeleton key={i} />)
          : orders.map((order) => {
          const delivery = getDeliveryLabel(order);
          return (
            <li
              key={order.id}
              className={`flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50 ${
                order.status === "cancelled" ? "opacity-60 bg-red-50" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={`/dashboard/stores/${storeId}/orders/${order.id}`}
                  className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <div className="flex items-start gap-4 sm:shrink-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            delivery.type === "entrega"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {delivery.type === "entrega" ? (
                            <MapPin className="h-3 w-3" />
                          ) : (
                            <Store className="h-3 w-3" />
                          )}
                          {delivery.type === "entrega" ? "Entrega" : "Retirada"}
                          {delivery.detail && (
                            <span className="text-blue-600/80">
                              · {delivery.detail}
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {order.customer && (
                        <p className="mt-0.5 text-sm text-gray-600">
                          {order.customer.name || order.customer.email}
                        </p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {order.paymentMethod && (
                          <span>
                            Pagamento: {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </span>
                        )}
                        {order.customer?.phone && (
                          <>
                            <span>·</span>
                            <span>{formatPhone(order.customer.phone)}</span>
                            <a
                              href={`https://wa.me/55${order.customer.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Sou da loja ${order.store?.name ?? ""}, estou em contato sobre seu pedido #${order.id.slice(-6).toUpperCase()}.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              WhatsApp
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center justify-end gap-3 sm:gap-4">
                    <p className="font-semibold text-primary">
                      {formatCurrency(Number(order.total))}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </div>
                </Link>
                <OrderRowDropdown
                  order={order}
                  storeId={storeId}
                  tenantId={session.tenantId}
                  onStatusChange={() => setRefresh((r) => r + 1)}
                />
              </div>
              {order.items && order.items.length > 0 && (
                <div className="ml-14 border-t border-gray-100 pt-2 sm:ml-[4.5rem]">
                  <p className="mb-1.5 text-xs font-medium text-gray-500">
                    Itens do pedido
                  </p>
                  <ul className="space-y-1 text-sm">
                    {order.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex justify-between gap-4 text-gray-700"
                      >
                        <span className="min-w-0 truncate">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="shrink-0 font-medium text-primary">
                          {formatCurrency(item.quantity * Number(item.price))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </DataList>

      {pagination && pagination.total > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[2rem] px-2 text-center text-sm text-gray-600">
              {page}
            </span>
            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-50"
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </StoreListPageLayout>
  );
}
