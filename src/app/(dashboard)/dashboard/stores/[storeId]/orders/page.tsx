"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronRight, ClipboardList } from "lucide-react";
import { LoadingSpinner } from "@/components/ui";
import {
  DataList,
  DataListItem,
  StoreListPageLayout,
} from "@/components/dashboard";
import { formatCurrency } from "@/lib/format";
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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-gray-100 text-gray-600",
};

export default function OrdersPage() {
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
        {orders.map((order) => (
          <DataListItem
            key={order.id}
            href={`/dashboard/stores/${storeId}/orders/${order.id}`}
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-primary">
                {formatCurrency(Number(order.total))}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </DataListItem>
        ))}
      </DataList>
    </StoreListPageLayout>
  );
}
