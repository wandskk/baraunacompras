"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, ImageUpload } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

const PAYMENT_LABELS: Record<string, string> = {
  pix: "PIX",
  credit: "Cartão de crédito",
  boleto: "Boleto",
  cash: "Dinheiro na entrega",
  pickup: "Pagamento na retirada",
};

const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Apenas retirada",
  delivery: "Apenas entrega",
  both: "Retirada e entrega",
};

type Store = {
  id: string;
  name: string;
  slug: string;
  theme?: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  paymentMethods?: string | null;
  deliveryType?: string | null;
  deliveryFee?: number | string | null;
  deliveryDays?: number | null;
  tenantId: string;
  tenant?: { slug: string };
};

type StoreStats = {
  pendingOrders: number;
  revenueThisMonth: number;
  lowStockCount: number;
};

export default function StoreDetailPage() {
  const router = useRouter();
  const params = useParams();
  const storeId = params.storeId as string;
  const { session, loading: sessionLoading } = useSession();
  const [store, setStore] = useState<Store | null>(null);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [theme, setTheme] = useState("default");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [description, setDescription] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (session) {
      fetchStore(session.tenantId);
    }
  }, [storeId, session]);

  async function fetchStore(tenantId: string) {
    try {
      const [storeRes, statsRes] = await Promise.all([
        fetch(`/api/tenants/${tenantId}/stores/${storeId}`),
        fetch(`/api/tenants/${tenantId}/stores/${storeId}/stats`),
      ]);
      if (!storeRes.ok) {
        setStore(null);
        return;
      }
      const data = await storeRes.json();
      setStore(data);
      if (statsRes.ok) setStats(await statsRes.json());
      setName(data.name);
      setSlug(data.slug);
      setTheme(data.theme ?? "default");
      setLogoUrl(data.logoUrl ?? "");
      setFaviconUrl(data.faviconUrl ?? "");
      setDescription(data.description ?? "");
      setContactEmail(data.contactEmail ?? "");
      setContactPhone(data.contactPhone ?? "");
      try {
        setPaymentMethods(
          data.paymentMethods ? JSON.parse(data.paymentMethods) : []
        );
      } catch {
        setPaymentMethods([]);
      }
      setDeliveryType(data.deliveryType ?? "pickup");
      setDeliveryFee(
        data.deliveryFee != null ? String(data.deliveryFee) : ""
      );
      setDeliveryDays(
        data.deliveryDays != null ? String(data.deliveryDays) : ""
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !store) return;
    setError("");
    setSaveLoading(true);
    try {
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          name,
          slug,
          theme,
          logoUrl: logoUrl || null,
          faviconUrl: faviconUrl || null,
          description: description || null,
          contactEmail: contactEmail || null,
          contactPhone: contactPhone || null,
        }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }
      setStore(data);
      setEditing(false);
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaveLoading(false);
    }
  }

  if (sessionLoading || loading || !session) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Loja não encontrada.</p>
        <Link href="/dashboard" className="mt-2 inline-block text-primary hover:underline">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar às lojas
      </Link>
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Editar
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancelar
            </Button>
          )}
        </div>
        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <Input
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tema
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="default">Azul (padrão)</option>
                <option value="purple">Roxo</option>
                <option value="green">Verde</option>
                <option value="amber">Âmbar</option>
              </select>
            </div>
            {session && (
              <>
                <ImageUpload
                  label="Logo"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  tenantId={session.tenantId}
                  placeholder="Enviar logo"
                />
                <ImageUpload
                  label="Favicon"
                  value={faviconUrl}
                  onChange={setFaviconUrl}
                  tenantId={session.tenantId}
                  placeholder="Enviar favicon"
                />
              </>
            )}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descrição da loja
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Um pouco sobre sua loja..."
              />
            </div>
            <Input
              label="Email de contato"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contato@loja.com"
            />
            <Input
              label="Telefone / WhatsApp"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Formas de pagamento
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={paymentMethods.includes(value)}
                      onChange={(e) =>
                        setPaymentMethods((prev) =>
                          e.target.checked
                            ? [...prev, value]
                            : prev.filter((p) => p !== value)
                        )
                      }
                      className="rounded"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de entrega
              </label>
              <select
                value={deliveryType}
                onChange={(e) => setDeliveryType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {Object.entries(DELIVERY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {(deliveryType === "delivery" || deliveryType === "both") && (
              <>
                <Input
                  label="Valor do frete (R$)"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="0,00"
                />
                <Input
                  label="Prazo de entrega (dias)"
                  type="number"
                  min="1"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  placeholder="3"
                />
              </>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button type="submit" disabled={saveLoading}>
              {saveLoading ? "Salvando..." : "Salvar"}
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-2">
            {store.logoUrl && (
              <div className="mb-4">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-16 object-contain"
                />
              </div>
            )}
            <p>
              <span className="font-medium text-gray-500">Slug:</span> {store.slug}
            </p>
            <p>
              <span className="font-medium text-gray-500">Tema:</span>{" "}
              {store.theme === "purple"
                ? "Roxo"
                : store.theme === "green"
                  ? "Verde"
                  : store.theme === "amber"
                    ? "Âmbar"
                    : "Azul"}
            </p>
            {store.description && (
              <p>
                <span className="font-medium text-gray-500">Descrição:</span>{" "}
                {store.description}
              </p>
            )}
            {store.contactEmail && (
              <p>
                <span className="font-medium text-gray-500">Email:</span>{" "}
                {store.contactEmail}
              </p>
            )}
            {store.contactPhone && (
              <p>
                <span className="font-medium text-gray-500">Contato:</span>{" "}
                {store.contactPhone}
              </p>
            )}
            {store.paymentMethods && (
              <p>
                <span className="font-medium text-gray-500">Pagamento:</span>{" "}
                {(() => {
                  try {
                    return (JSON.parse(store.paymentMethods) as string[])
                      .map((p) => PAYMENT_LABELS[p] ?? p)
                      .join(", ");
                  } catch {
                    return store.paymentMethods;
                  }
                })()}
              </p>
            )}
            {(store.deliveryType === "delivery" || store.deliveryType === "both") && (
              <p>
                <span className="font-medium text-gray-500">Entrega:</span>{" "}
                {store.deliveryFee != null
                  ? `R$ ${Number(store.deliveryFee).toFixed(2)}`
                  : "A combinar"}{" "}
                {store.deliveryDays != null &&
                  `• ${store.deliveryDays} dia(s)`}
              </p>
            )}
            {store.tenant && (
              <a
                href={`/loja/${store.tenant.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block font-medium text-primary hover:underline"
              >
                Ver loja →
              </a>
            )}
            {stats && (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Link
                  href={`/dashboard/stores/${storeId}/orders`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <p className="text-2xl font-bold text-primary">
                    {stats.pendingOrders}
                  </p>
                  <p className="text-sm text-gray-600">Pedidos pendentes</p>
                </Link>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-2xl font-bold text-primary">
                    R$ {stats.revenueThisMonth.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Receita este mês</p>
                </div>
                <Link
                  href={`/dashboard/stores/${storeId}/products`}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <p className="text-2xl font-bold text-primary">
                    {stats.lowStockCount}
                  </p>
                  <p className="text-sm text-gray-600">Produtos com baixo estoque</p>
                </Link>
              </div>
            )}
            <div className="mt-6 flex gap-2">
              <Link href={`/dashboard/stores/${storeId}/categories`}>
                <Button variant="secondary">Categorias</Button>
              </Link>
              <Link href={`/dashboard/stores/${storeId}/products`}>
                <Button variant="secondary">Produtos</Button>
              </Link>
              <Link href={`/dashboard/stores/${storeId}/orders`}>
                <Button variant="secondary">Pedidos</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
