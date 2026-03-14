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
  MapPin,
  FileText,
} from "lucide-react";
import { Button, Input, ImageUpload, LoadingSpinner, MaskedInput } from "@/components/ui";
import { formatCep, formatCurrency, formatPhone } from "@/lib/format";
import { parseCurrencyToNumber, formatNumberToCurrency } from "@/lib/masks";
import { fetchAddressByCep } from "@/lib/viacep";
import { toast } from "@/lib/toast";
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
  contactPhoneIsWhatsApp?: boolean;
  paymentMethods?: string | null;
  deliveryType?: string | null;
  deliveryFee?: number | string | null;
  deliveryDays?: number | null;
  addressStreet?: string | null;
  addressNumber?: string | null;
  addressComplement?: string | null;
  addressNeighborhood?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressZipCode?: string | null;
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
  const [contactPhoneIsWhatsApp, setContactPhoneIsWhatsApp] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [deliveryType, setDeliveryType] = useState("pickup");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZipCode, setAddressZipCode] = useState("");
  const [error, setError] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");

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
      setContactPhone(
        data.contactPhone ? formatPhone(data.contactPhone) : ""
      );
      setContactPhoneIsWhatsApp(data.contactPhoneIsWhatsApp ?? false);
      try {
        setPaymentMethods(
          data.paymentMethods ? JSON.parse(data.paymentMethods) : []
        );
      } catch {
        setPaymentMethods([]);
      }
      setDeliveryType(data.deliveryType ?? "pickup");
      setDeliveryFee(
        data.deliveryFee != null ? formatNumberToCurrency(Number(data.deliveryFee)) : ""
      );
      setDeliveryDays(
        data.deliveryDays != null ? String(data.deliveryDays) : ""
      );
      setAddressStreet(data.addressStreet ?? "");
      setAddressNumber(data.addressNumber ?? "");
      setAddressComplement(data.addressComplement ?? "");
      setAddressNeighborhood(data.addressNeighborhood ?? "");
      setAddressCity(data.addressCity ?? "");
      setAddressState(data.addressState ?? "");
      setAddressZipCode(
        data.addressZipCode ? formatCep(data.addressZipCode) : ""
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCepBlur() {
    const digits = addressZipCode.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepError("");
    setCepLoading(true);
    try {
      const data = await fetchAddressByCep(addressZipCode);
      if (data) {
        setAddressStreet(data.logradouro ?? "");
        setAddressNeighborhood(data.bairro ?? "");
        setAddressCity(data.localidade ?? "");
        setAddressState(data.uf ?? "");
      } else {
        setCepError("CEP não encontrado");
      }
    } finally {
      setCepLoading(false);
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
        contactPhone: (contactPhone && contactPhone.replace(/\D/g, "")) || null,
        contactPhoneIsWhatsApp: contactPhoneIsWhatsApp,
        paymentMethods: paymentMethods.length ? paymentMethods : null,
        deliveryType: deliveryType || null,
        deliveryFee:
          deliveryFee !== "" ? parseCurrencyToNumber(deliveryFee) || null : null,
        deliveryDays:
          deliveryDays !== "" ? parseInt(deliveryDays, 10) || null : null,
        addressStreet: addressStreet || null,
        addressNumber: addressNumber || null,
        addressComplement: addressComplement || null,
        addressNeighborhood: addressNeighborhood || null,
        addressCity: addressCity || null,
        addressState: addressState || null,
        addressZipCode: (addressZipCode && addressZipCode.replace(/\D/g, "")) || null,
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
        const msg = data.error ?? "Erro ao salvar";
        setError(msg);
        toast.error(msg);
        return;
      }
      toast.success("Loja atualizada com sucesso");
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
      toast.error("Erro de conexão");
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
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar às lojas
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            {store.logoUrl ? (
              <div className="flex h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-full w-full object-contain p-1"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-primary/5">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                {store.name}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">/{store.slug}</p>
              {store.tenant && (
                <a
                  href={`/loja/${store.slug}`}
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
          <div className="flex shrink-0 gap-2">
            {!editing ? (
              <Button
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

        {!editing && stats && (
          <div className="mt-6 grid gap-4 border-t border-gray-100 pt-6 sm:grid-cols-3">
            <Link
              href={`/dashboard/stores/${storeId}/orders`}
              className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Pedidos pendentes
                </p>
                <p className="text-xs text-gray-500">
                  Aguardando processamento
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums text-amber-600">
                {stats.pendingOrders}
              </span>
            </Link>
            <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Receita este mês
                </p>
                <p className="text-xs text-gray-500">Total acumulado</p>
              </div>
              <span className="text-xl font-bold tabular-nums text-primary">
                {formatCurrency(stats.revenueThisMonth)}
              </span>
            </div>
            <Link
              href={`/dashboard/stores/${storeId}/products?lowStock=true`}
              className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Estoque baixo
                </p>
                <p className="text-xs text-gray-500">
                  Produtos com alerta
                </p>
              </div>
              <span className="text-xl font-bold tabular-nums text-red-600">
                {stats.lowStockCount}
              </span>
            </Link>
          </div>
        )}
      </div>

      {editing ? (
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
                <MaskedInput
                  label="Telefone / WhatsApp"
                  mask="phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  O número informado é WhatsApp?
                </p>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="contactPhoneIsWhatsApp"
                      checked={contactPhoneIsWhatsApp === true}
                      onChange={() => setContactPhoneIsWhatsApp(true)}
                      className="text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="contactPhoneIsWhatsApp"
                      checked={contactPhoneIsWhatsApp === false}
                      onChange={() => setContactPhoneIsWhatsApp(false)}
                      className="text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm text-gray-700">Não</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-primary" />
              Endereço da loja
            </h2>
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <MaskedInput
                    label="CEP"
                    mask="cep"
                    value={addressZipCode}
                    onChange={(e) => {
                      setAddressZipCode(e.target.value);
                      setCepError("");
                    }}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    disabled={cepLoading}
                  />
                  {cepLoading && (
                    <p className="mt-1 text-sm text-gray-500">Buscando endereço...</p>
                  )}
                  {cepError && (
                    <p className="mt-1 text-sm text-amber-600">{cepError}</p>
                  )}
                </div>
                <Input
                  label="Rua"
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <Input
                  label="Número"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  placeholder="123"
                />
                <Input
                  label="Complemento"
                  value={addressComplement}
                  onChange={(e) => setAddressComplement(e.target.value)}
                  placeholder="Sala, loja..."
                />
                <Input
                  label="Bairro"
                  value={addressNeighborhood}
                  onChange={(e) => setAddressNeighborhood(e.target.value)}
                  placeholder="Centro"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <Input
                  label="Cidade"
                  value={addressCity}
                  onChange={(e) => setAddressCity(e.target.value)}
                  placeholder="São Paulo"
                />
                <Input
                  label="Estado (UF)"
                  value={addressState}
                  onChange={(e) =>
                    setAddressState(e.target.value.toUpperCase().slice(0, 2))
                  }
                  placeholder="SP"
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
                  <MaskedInput
                    label="Valor do frete (R$)"
                    mask="currency"
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
        <>
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
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Informações
            </h2>
            <div className="space-y-5">
              {/* Linha 1: Tema, Email, Contato */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Tema
                    </p>
                    <p className="mt-0.5 font-medium text-gray-900">
                      {THEME_LABELS[store.theme ?? "default"] ?? store.theme}
                    </p>
                  </div>
                </div>
                {store.contactEmail && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email
                      </p>
                      <p className="mt-0.5 font-medium text-gray-900">
                        {store.contactEmail}
                      </p>
                    </div>
                  </div>
                )}
                {store.contactPhone && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Contato
                      </p>
                      <p className="mt-0.5 font-medium text-gray-900">
                        {formatPhone(store.contactPhone)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Descrição */}
              {store.description && (
                <div className="flex items-start gap-3 border-t border-gray-100 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Descrição
                    </p>
                    <p className="mt-0.5 text-gray-900">{store.description}</p>
                  </div>
                </div>
              )}

              {/* Endereço */}
              {(store.addressStreet ||
                store.addressCity ||
                store.addressZipCode) && (
                <div className="flex items-start gap-3 border-t border-gray-100 pt-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      Endereço
                    </p>
                    <p className="mt-0.5 text-gray-900">
                      {[
                        store.addressStreet &&
                          `${store.addressStreet}${store.addressNumber ? `, ${store.addressNumber}` : ""}${store.addressComplement ? ` - ${store.addressComplement}` : ""}`,
                        store.addressNeighborhood &&
                          store.addressNeighborhood,
                        store.addressCity &&
                          store.addressState
                            ? `${store.addressCity} - ${store.addressState}`
                            : store.addressCity || store.addressState,
                        store.addressZipCode && formatCep(store.addressZipCode),
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Pagamento e Entrega */}
              <div className="grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2">
                {store.paymentMethods && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Formas de pagamento
                      </p>
                      <p className="mt-0.5 text-gray-900">
                        {(() => {
                          try {
                            return (
                              JSON.parse(store.paymentMethods) as string[]
                            ).map((p) => PAYMENT_LABELS[p] ?? p).join(", ");
                          } catch {
                            return store.paymentMethods;
                          }
                        })()}
                      </p>
                    </div>
                  </div>
                )}
                {(store.deliveryType === "delivery" ||
                  store.deliveryType === "both") && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                        Entrega
                      </p>
                      <p className="mt-0.5 text-gray-900">
                        {store.deliveryFee != null
                          ? formatCurrency(Number(store.deliveryFee))
                          : "A combinar"}{" "}
                        {store.deliveryDays != null &&
                          `• ${store.deliveryDays} dia(s)`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
