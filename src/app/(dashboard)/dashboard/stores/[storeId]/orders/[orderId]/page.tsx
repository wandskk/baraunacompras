"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Store,
  MessageCircle,
  ChevronLeft,
  ClipboardList,
  Package,
  Check,
  Truck,
  X,
} from "lucide-react";
import { formatCurrency, formatCep, formatPhone } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/payment-labels";
import {
  ORDER_STATUS_LABELS,
  ORDER_ACTION_LABELS,
  DELIVERY_TYPE_LABELS,
  getShippedActionLabel,
  getShippedStatusLabel,
} from "@/lib/order-labels";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, PageLoadingOverlay } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useSession } from "@/hooks/useSession";
import {
  startGlobalActionLoading,
  endGlobalActionLoading,
} from "@/components/GlobalActionLoader";

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  price: string;
  variation?: string;
  size?: string;
  product: { name: string; slug: string };
};

type Customer = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
} | null;

type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  store: { name: string };
  customer: Customer;
  items: OrderItem[];
  paymentMethod?: string | null;
  deliveryType?: string;
  deliveryFee?: string | number;
  deliveryStreet?: string | null;
  deliveryNumber?: string | null;
  deliveryComplement?: string | null;
  deliveryNeighborhood?: string | null;
  deliveryCity?: string | null;
  deliveryState?: string | null;
  deliveryZipCode?: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function OrderDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const orderId = params.orderId as string;
  const { session, loading: sessionLoading } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  async function fetchOrder() {
    if (!session) return;
    const res = await fetch(
      `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`,
    );
    if (res.ok) setOrder(await res.json());
  }

  async function handleStatusChange(newStatus: string) {
    if (!session || !order) return;
    setStatusLoading(true);
    startGlobalActionLoading();
    try {
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setOrder(await res.json());
        toast.success(
          `Status atualizado para ${
            newStatus === "shipped"
              ? getShippedStatusLabel(order.deliveryType)
              : ORDER_STATUS_LABELS[newStatus] ?? newStatus
          }`,
        );
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao atualizar status");
      }
    } finally {
      setStatusLoading(false);
      endGlobalActionLoading();
    }
  }

  useEffect(() => {
    if (!session) return;
    fetch(
      `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [storeId, orderId, session]);

  if (sessionLoading || loading || !session) {
    return <PageLoadingOverlay show message="Carregando pedido..." />;
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Pedido não encontrado.</p>
        <Link
          href={`/dashboard/stores/${storeId}/orders`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar aos pedidos
        </Link>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const hasPhone = order.customer?.phone;
  const whatsAppHref = hasPhone
    ? `https://wa.me/55${order.customer!.phone!.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Sou da loja ${order.store.name}, estou em contato sobre seu pedido #${order.id.slice(-6).toUpperCase()}.`)}`
    : "#";

  return (
    <div className="space-y-4 sm:space-y-6">
      <Link
        href={`/dashboard/stores/${storeId}/orders`}
        className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700 sm:gap-1.5 sm:text-sm"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Voltar aos pedidos
      </Link>

      {/* Card principal */}
      <div
        className={`overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl ${
          isCancelled ? "opacity-75 bg-red-50/30" : ""
        }`}
      >
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-11 sm:w-11">
                  <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h1 className="text-base font-bold tracking-tight text-gray-900 sm:text-lg">
                      #{order.id.slice(-6).toUpperCase()}
                    </h1>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium sm:px-2.5 sm:text-xs ${
                        STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {order.status === "shipped"
                        ? getShippedStatusLabel(order.deliveryType)
                        : ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <p className="text-base font-bold text-primary sm:text-xl">
              {formatCurrency(Number(order.total))}
            </p>
            {hasPhone && (
              <a
                href={whatsAppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-green-600 px-2.5 text-xs font-medium text-white transition-colors hover:bg-green-700 sm:h-9 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                WhatsApp
              </a>
            )}
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {order.status === "pending" && (
                  <Button
                    variant="primary"
                    disabled={statusLoading}
                    onClick={() => handleStatusChange("confirmed")}
                    className="h-8 gap-1 px-2.5 text-xs sm:h-9 sm:gap-1.5 sm:px-4 sm:text-sm"
                  >
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {ORDER_ACTION_LABELS.confirmed}
                  </Button>
                )}
                {order.status === "confirmed" && (
                  <Button
                    variant="outline"
                    disabled={statusLoading}
                    onClick={() => handleStatusChange("shipped")}
                    className="h-8 gap-1 px-2.5 text-xs sm:h-9 sm:gap-1.5 sm:px-4 sm:text-sm"
                  >
                    {order.deliveryType === "pickup" ? (
                      <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : (
                      <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                    {getShippedActionLabel(order.deliveryType)}
                  </Button>
                )}
                {order.status === "shipped" && (
                  <Button
                    variant="outline"
                    disabled={statusLoading}
                    onClick={() => handleStatusChange("delivered")}
                    className="h-8 gap-1 px-2.5 text-xs sm:h-9 sm:gap-1.5 sm:px-4 sm:text-sm"
                  >
                    <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {ORDER_ACTION_LABELS.delivered}
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("cancelled")}
                  className="h-8 gap-1 border-red-200 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 sm:h-9 sm:gap-1.5 sm:px-4 sm:text-sm"
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {ORDER_ACTION_LABELS.cancelled}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detalhes em grid compacto */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
        <div className="grid gap-0 sm:grid-cols-3">
          <div className="border-b border-gray-100 p-3 sm:border-b-0 sm:border-r sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
              Cliente
            </p>
            {order.customer ? (
              <div className="mt-1.5 space-y-0.5 sm:mt-2">
                <p className="text-sm font-medium text-gray-900 sm:text-base">
                  {order.customer.name || "—"}
                </p>
                <p className="truncate text-xs text-gray-600 sm:text-sm">
                  {order.customer.email}
                </p>
                {order.customer.phone && (
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {formatPhone(order.customer.phone)}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-gray-500 sm:mt-2 sm:text-sm">
                Não identificado
              </p>
            )}
          </div>
          <div className="border-b border-gray-100 p-3 sm:border-b-0 sm:border-r sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
              Pagamento
            </p>
            <p className="mt-1.5 text-sm text-gray-900 sm:mt-2 sm:text-base">
              {order.paymentMethod
                ? PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod
                : "Não informado"}
            </p>
          </div>
          <div className="p-3 sm:p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 sm:text-xs">
              Entrega
            </p>
            {order.deliveryType === "delivery" &&
            (order.deliveryStreet ||
              order.deliveryCity ||
              order.deliveryZipCode) ? (
              <div className="mt-1.5 flex gap-2 text-xs text-gray-900 sm:mt-2 sm:text-sm">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                <div>
                <p>
                  {[
                    order.deliveryStreet &&
                      `${order.deliveryStreet}${order.deliveryNumber ? `, ${order.deliveryNumber}` : ""}${order.deliveryComplement ? ` - ${order.deliveryComplement}` : ""}`,
                    order.deliveryNeighborhood,
                    order.deliveryCity &&
                      order.deliveryState &&
                      `${order.deliveryCity} - ${order.deliveryState}`,
                    order.deliveryZipCode && formatCep(order.deliveryZipCode),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.deliveryFee != null && Number(order.deliveryFee) > 0 && (
                  <p className="mt-0.5 text-gray-500">
                    Taxa: {formatCurrency(order.deliveryFee)}
                  </p>
                )}
                </div>
              </div>
            ) : (
              <div className="mt-1.5 flex items-center gap-1.5 text-gray-900 sm:mt-2 sm:gap-2">
                <Store className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">
                  {DELIVERY_TYPE_LABELS.pickup}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itens */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm sm:rounded-xl">
        <ul className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 sm:text-base">
                  {item.product.name}
                </p>
                <p className="text-xs text-gray-500 sm:text-sm">
                  {item.quantity}x {formatCurrency(Number(item.price))}
                  {(item.variation || item.size) && (
                    <span className="text-gray-400">
                      {" "}
                      · {[item.variation, item.size].filter(Boolean).join(" • ")}
                    </span>
                  )}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold text-primary sm:text-base">
                {formatCurrency(item.quantity * Number(item.price))}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-sm font-semibold text-gray-900 sm:text-base">
            Total
          </p>
          <p className="text-base font-bold text-primary sm:text-lg">
            {formatCurrency(Number(order.total))}
          </p>
        </div>
      </div>
    </div>
  );
}
