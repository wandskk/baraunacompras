"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

type Order = {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  customerId: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export default function OrdersPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/tenants/${session.tenantId}/stores/${storeId}/orders`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [storeId, session]);

  if (sessionLoading || loading || !session) {
    return <LoadingSpinner message="Carregando pedidos..." minHeight="200px" />;
  }

  return (
    <div>
      <Link
        href={`/dashboard/stores/${storeId}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar à loja
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Pedidos</h1>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum pedido ainda.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/dashboard/stores/${storeId}/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50"
                >
                <div>
                  <p className="font-medium text-gray-900">
                    #{order.id.slice(-6).toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">
                    R$ {Number(order.total).toFixed(2)}
                  </p>
                  <span className="inline-block rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
