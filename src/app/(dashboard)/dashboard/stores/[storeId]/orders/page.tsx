"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import {
  ChevronRight,
  ClipboardList,
  MoreVertical,
  MapPin,
  Store,
  ExternalLink,
  Check,
  Truck,
  Package,
  X,
} from "lucide-react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui";
import {
  DataList,
  StoreListPageLayout,
} from "@/components/dashboard";
import { formatCurrency } from "@/lib/format";
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
  deliveryType?: string;
  deliveryStreet?: string | null;
  deliveryNumber?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryZipCode?: string | null;
  customer: { name: string | null; email: string } | null;
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

export default function OrdersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/tenants/${session.tenantId}/stores/${storeId}/orders`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [storeId, session, refresh]);

  if (sessionLoading || loading || !session) {
    return (
      <LoadingSpinner message="Carregando pedidos..." minHeight="200px" />
    );
  }

  return (
    <StoreListPageLayout storeId={storeId} title="Pedidos">
      <DataList
        empty={orders.length === 0}
        emptyMessage="Nenhum pedido registrado."
        emptyIcon={ClipboardList}
      >
        {orders.map((order) => {
          const delivery = getDeliveryLabel(order);
          return (
            <li
              key={order.id}
              className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50"
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
    </StoreListPageLayout>
  );
}
