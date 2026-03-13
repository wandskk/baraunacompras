"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ExternalLink,
  Package,
  TrendingUp,
  AlertTriangle,
  Settings,
  Pencil,
  X,
  Palette,
  Mail,
  Phone,
  CreditCard,
  Truck,
  FolderOpen,
  ShoppingBag,
  ClipboardList,
} from "lucide-react";
import { Button, Input, ImageUpload, LoadingSpinner } from "@/components/ui";
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

const THEME_LABELS: Record<string, string> = {
  default: "Azul (padrão)",
  purple: "Roxo",
  green: "Verde",
  amber: "Âmbar",
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

const QUICK_LINKS = [
  {
    href: (id: string) => `/dashboard/stores/${id}/categories`,
    label: "Categorias",
    icon: FolderOpen,
    description: "Organize seus produtos",
  },
  {
    href: (id: string) => `/dashboard/stores/${id}/products`,
    label: "Produtos",
    icon: ShoppingBag,
    description: "Gerencie o catálogo",
  },
  {
    href: (id: string) => `/dashboard/stores/${id}/orders`,
    label: "Pedidos",
    icon: ClipboardList,
    description: "Acompanhe vendas",
  },
] as const;

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
      const body = {
        name,
        slug,
        theme,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        description: description || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        paymentMethods: paymentMethods.length ? paymentMethods : null,
        deliveryType: deliveryType || null,
        deliveryFee:
          deliveryFee !== "" ? parseFloat(deliveryFee) || null : null,
        deliveryDays:
          deliveryDays !== "" ? parseInt(deliveryDays, 10) || null : null,
      };
      const res = await fetch(
        `/api/tenants/${session.tenantId}/stores/${storeId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }
      setStore(data);
      setEditing(false);
      if (data.theme) {
        window.dispatchEvent(
          new CustomEvent("store-theme-changed", {
            detail: { theme: data.theme },
          })
        );
      }
      router.refresh();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaveLoading(false);
    }
  }

  if (sessionLoading || loading || !session) {
    return <LoadingSpinner message="Carregando loja..." minHeight="200px" />;
  }

  if (!store) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-600">Loja não encontrada.</p>
        <Link
          href="/dashboard"
          className="mt-2 inline-block text-primary hover:underline"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb e header */}
      <div>
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar às lojas
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {store.logoUrl ? (
              <div className="flex h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {store.name}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">/{store.slug}</p>
              {store.tenant && (
                <a
                  href={`/loja/${store.tenant.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Ver loja
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {!editing ? (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setEditing(false)}
                className="inline-flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      {editing ? (
        /* Formulário de edição */
        <form onSubmit={handleSave} className="space-y-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Settings className="h-5 w-5 text-primary" />
              Configurações da loja
            </h2>
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <Input
                  label="Slug (URL)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  placeholder="minha-loja"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Palette className="h-4 w-4" />
                    Tema
                  </span>
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {Object.entries(THEME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {session && (
                <div className="grid gap-6 sm:grid-cols-2">
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
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descrição da loja
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Um pouco sobre sua loja..."
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
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
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagamento e entrega
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Formas de pagamento
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 transition-colors hover:bg-gray-50 has-[input:checked]:border-primary has-[input:checked]:bg-primary/5"
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
                        className="rounded border-gray-300 text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    Tipo de entrega
                  </span>
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {Object.entries(DELIVERY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              {(deliveryType === "delivery" || deliveryType === "both") && (
                <div className="grid gap-6 sm:grid-cols-2">
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
                </div>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" disabled={saveLoading}>
            {saveLoading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      ) : (
        /* Modo visualização */
        <>
          {/* Cards de métricas */}
          {stats && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Link
                href={`/dashboard/stores/${storeId}/orders`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-amber-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                      <Package className="h-5 w-5 text-amber-600" />
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
                  <span className="text-2xl font-bold text-amber-700">
                    {stats.pendingOrders}
                  </span>
                </div>
              </Link>
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Receita este mês
                      </p>
                      <p className="text-xs text-gray-500">Total acumulado</p>
                    </div>
                  </div>
                  <span className="text-xl font-bold text-emerald-700">
                    R$ {stats.revenueThisMonth.toFixed(2)}
                  </span>
                </div>
              </div>
              <Link
                href={`/dashboard/stores/${storeId}/products`}
                className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-red-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50/80 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
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
                  <span className="text-2xl font-bold text-red-700">
                    {stats.lowStockCount}
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Links rápidos */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Ações rápidas
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {QUICK_LINKS.map(({ href, label, icon: Icon, description }) => (
                <Link
                  key={label}
                  href={href(storeId)}
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-primary">
                      {label}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Informações da loja */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Informações
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tema</dt>
                <dd className="mt-0.5 text-gray-900">
                  {THEME_LABELS[store.theme ?? "default"] ?? store.theme}
                </dd>
              </div>
              {store.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Descrição
                  </dt>
                  <dd className="mt-0.5 text-gray-900">{store.description}</dd>
                </div>
              )}
              {store.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-0.5 text-gray-900">
                      {store.contactEmail}
                    </dd>
                  </div>
                </div>
              )}
              {store.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Contato
                    </dt>
                    <dd className="mt-0.5 text-gray-900">
                      {store.contactPhone}
                    </dd>
                  </div>
                </div>
              )}
              {store.paymentMethods && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Formas de pagamento
                    </dt>
                    <dd className="mt-0.5 text-gray-900">
                      {(() => {
                        try {
                          return (
                            JSON.parse(store.paymentMethods) as string[]
                          ).map((p) => PAYMENT_LABELS[p] ?? p).join(", ");
                        } catch {
                          return store.paymentMethods;
                        }
                      })()}
                    </dd>
                  </div>
                </div>
              )}
              {(store.deliveryType === "delivery" ||
                store.deliveryType === "both") && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Truck className="h-4 w-4 shrink-0 text-gray-400" />
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Entrega
                    </dt>
                    <dd className="mt-0.5 text-gray-900">
                      {store.deliveryFee != null
                        ? `R$ ${Number(store.deliveryFee).toFixed(2)}`
                        : "A combinar"}{" "}
                      {store.deliveryDays != null &&
                        `• ${store.deliveryDays} dia(s)`}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </div>
        </>
      )}
    </div>
  );
}
