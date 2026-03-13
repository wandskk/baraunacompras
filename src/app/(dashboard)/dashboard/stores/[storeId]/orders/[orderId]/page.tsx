"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/format";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, LoadingSpinner } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useSession } from "@/hooks/useSession";

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
} | null;

type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  store: { name: string };
  customer: Customer;
  items: OrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
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
      `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`
    );
    if (res.ok) setOrder(await res.json());
  }

  async function handleStatusChange(newStatus: string) {
    if (!session || !order) return;
    setStatusLoading(true);
    try {
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (res.ok) {
        setOrder(await res.json());
        toast.success(
          `Status atualizado para ${STATUS_LABELS[newStatus] ?? newStatus}`,
        );
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Erro ao atualizar status");
      }
    } finally {
      setStatusLoading(false);
    }
  }

  useEffect(() => {
    if (!session) return;
    fetch(
      `/api/tenants/${session.tenantId}/stores/${storeId}/orders/${orderId}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [storeId, orderId, session]);

  if (sessionLoading || loading || !session) {
    return <LoadingSpinner message="Carregando pedido..." minHeight="200px" />;
  }

  if (!order) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Pedido não encontrado.</p>
        <Link
          href={`/dashboard/stores/${storeId}/orders`}
          className="mt-2 inline-block text-primary hover:underline"
        >
          Voltar aos pedidos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/dashboard/stores/${storeId}/orders`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar aos pedidos
      </Link>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
          {order.status !== "cancelled" && order.status !== "delivered" && (
            <div className="flex flex-wrap gap-2">
              {order.status === "pending" && (
                <Button
                  variant="outline"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("confirmed")}
                >
                  Confirmar
                </Button>
              )}
              {order.status === "confirmed" && (
                <Button
                  variant="outline"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("shipped")}
                >
                  Marcar enviado
                </Button>
              )}
              {order.status === "shipped" && (
                <Button
                  variant="outline"
                  disabled={statusLoading}
                  onClick={() => handleStatusChange("delivered")}
                >
                  Marcar entregue
                </Button>
              )}
              <Button
                variant="outline"
                disabled={statusLoading}
                onClick={() => handleStatusChange("cancelled")}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Cliente</h2>
          {order.customer ? (
            <div className="space-y-1">
              <p className="font-medium text-gray-900">
                {order.customer.name || "—"}
              </p>
              <p className="text-sm text-gray-600">{order.customer.email}</p>
            </div>
          ) : (
            <p className="text-gray-500">Cliente não identificado</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Itens</h2>
          <ul className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.quantity}x R$ {Number(item.price).toFixed(2)}
                    {(item.variation || item.size) && (
                      <span className="ml-1">
                        ({[item.variation, item.size].filter(Boolean).join(" • ")})
                      </span>
                    )}
                  </p>
                </div>
                <p className="font-medium text-primary">
                  {formatCurrency(item.quantity * Number(item.price))}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="flex justify-between text-lg font-bold text-gray-900">
              Total
              <span className="text-primary">
                {formatCurrency(order.total)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
