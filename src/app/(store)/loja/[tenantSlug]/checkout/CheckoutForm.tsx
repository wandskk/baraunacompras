"use client";

import { useState, useEffect } from "react";
import { MapPin, Store } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { AddressCityStateSelect } from "@/components/AddressCityStateSelect";
import { toast } from "@/lib/toast";
import { getBuyerData, setBuyerData, type BuyerAddress } from "@/lib/buyer-storage";
import { formatCurrency } from "@/lib/format";

type StoreAddress = {
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
};

type CheckoutFormProps = {
  tenantSlug: string;
  tenantId: string;
  storeId: string;
  productId?: string;
  productName?: string;
  total?: number;
  cartId?: string;
  storeDeliveryType?: "pickup" | "delivery" | "both";
  storeDeliveryFee?: number;
  storeDeliveryDays?: number;
  storeAddress?: StoreAddress;
};

function formatStoreAddress(addr: StoreAddress): string {
  const parts: string[] = [];
  if (addr.addressStreet) {
    let street = addr.addressStreet;
    if (addr.addressNumber) street += `, ${addr.addressNumber}`;
    if (addr.addressComplement) street += ` - ${addr.addressComplement}`;
    parts.push(street);
  }
  if (addr.addressNeighborhood) parts.push(addr.addressNeighborhood);
  if (addr.addressCity && addr.addressState) {
    parts.push(`${addr.addressCity} - ${addr.addressState}`);
  }
  return parts.join(", ");
}

export function CheckoutForm({
  tenantSlug,
  tenantId,
  storeId,
  productId,
  total: productTotal,
  cartId,
  storeDeliveryType = "pickup",
  storeDeliveryFee = 0,
  storeDeliveryDays,
  storeAddress = {},
}: CheckoutFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [deliveryOption, setDeliveryOption] = useState<"pickup" | "delivery">(
    storeDeliveryType === "delivery" ? "delivery" : "pickup"
  );
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);
  const [cartTotal, setCartTotal] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const hasPickup = storeDeliveryType === "pickup" || storeDeliveryType === "both";
  const hasDelivery = storeDeliveryType === "delivery" || storeDeliveryType === "both";
  const subtotal = cartId ? (cartTotal ?? 0) : (productTotal ?? 0);
  const deliveryFee = deliveryOption === "delivery" ? storeDeliveryFee : 0;
  const total = subtotal + deliveryFee;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isDeliveryAddressValid =
    zipCode.replace(/\D/g, "").length === 8 &&
    street.trim() !== "" &&
    number.trim() !== "" &&
    neighborhood.trim() !== "" &&
    state.trim().length === 2 &&
    city.trim() !== "";
  const isFormValid =
    isEmailValid &&
    (deliveryOption === "pickup" || (deliveryOption === "delivery" && isDeliveryAddressValid));

  useEffect(() => {
    const saved = getBuyerData();
    if (saved) {
      setEmail(saved.email);
      if (saved.name) setName(saved.name);
      if (saved.address) {
        setZipCode(saved.address.zipCode);
        setStreet(saved.address.street);
        setNumber(saved.address.number);
        setComplement(saved.address.complement ?? "");
        setNeighborhood(saved.address.neighborhood);
        setCity(saved.address.city);
        setState(saved.address.state);
      }
    }
  }, []);

  useEffect(() => {
    if (cartId && tenantSlug) {
      fetch(`/api/public/${tenantSlug}/cart`, { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setCartTotal(data.total ?? 0))
        .catch(() => setCartTotal(0));
    }
  }, [cartId, tenantSlug]);

  async function handleCepBlur() {
    const digits = zipCode.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setStreet(data.logradouro ?? "");
        setNeighborhood(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setState(data.uf ?? "");
      }
    } catch {
      // ignore
    } finally {
      setLoadingCep(false);
    }
  }

  function handleZipCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 5) {
      setZipCode(digits);
    } else {
      setZipCode(`${digits.slice(0, 5)}-${digits.slice(5)}`);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = cartId
        ? {
            email,
            name: name || undefined,
            cartId,
            deliveryType: deliveryOption,
            deliveryAddress:
              deliveryOption === "delivery"
                ? {
                    zipCode: zipCode.replace(/\D/g, ""),
                    street,
                    number,
                    complement: complement || undefined,
                    neighborhood,
                    city,
                    state: state.toUpperCase().slice(0, 2),
                  }
                : undefined,
          }
        : {
            email,
            name: name || undefined,
            productId,
            total: productTotal,
            deliveryType: deliveryOption,
            deliveryAddress:
              deliveryOption === "delivery"
                ? {
                    zipCode: zipCode.replace(/\D/g, ""),
                    street,
                    number,
                    complement: complement || undefined,
                    neighborhood,
                    city,
                    state: state.toUpperCase().slice(0, 2),
                  }
                : undefined,
          };

      const res = await fetch(
        `/api/tenants/${tenantId}/stores/${storeId}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Erro ao finalizar compra";
        setError(msg);
        toast.error(msg);
        return;
      }
      const buyerData: { email: string; name?: string; address?: BuyerAddress } = {
        email,
        name: name || undefined,
      };
      if (deliveryOption === "delivery" && street && number && neighborhood && city && state) {
        buyerData.address = {
          zipCode,
          street,
          number,
          complement: complement || undefined,
          neighborhood,
          city,
          state: state.slice(0, 2),
        };
      }
      setBuyerData(buyerData);
      window.dispatchEvent(new CustomEvent("cart-updated"));
      toast.success("Pedido realizado com sucesso!");
      setSuccess(true);
    } catch {
      setError("Erro de conexão");
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 rounded-2xl bg-primary/5 p-6 text-center">
        <p className="font-semibold text-primary">Pedido realizado com sucesso!</p>
        <p className="mt-2 text-sm text-gray-600">
          Você receberá a confirmação por email.
        </p>
      </div>
    );
  }

  function resetDeliveryOption() {
    setDeliveryOption("pickup");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5 pb-28 sm:pb-6">
      <section className="space-y-4">
        <div className="space-y-3">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-12 text-base"
          />
          <Input
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Opcional"
            className="h-12 text-base"
          />
        </div>
      </section>

      {hasPickup && hasDelivery ? (
        <section className="space-y-3">
          <p className="text-sm font-medium text-navy">Forma de recebimento</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetDeliveryOption}
              className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                deliveryOption === "pickup"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <Store className="h-5 w-5 shrink-0" />
              <span className="font-medium">Retirar</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryOption("delivery")}
              className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl border p-3 transition-all ${
                deliveryOption === "delivery"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-gray-600"
              }`}
            >
              <MapPin className="h-5 w-5 shrink-0" />
              <span className="font-medium">Entrega</span>
            </button>
          </div>
        </section>
      ) : null}

      {deliveryOption === "pickup" && hasPickup && formatStoreAddress(storeAddress) && (
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
          <Store className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-navy">Endereço para retirada</p>
            <p className="mt-0.5 text-sm text-gray-600">{formatStoreAddress(storeAddress)}</p>
          </div>
        </div>
      )}

      {deliveryOption === "delivery" && hasDelivery && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-navy">Endereço de entrega</span>
          </div>
          <div className="space-y-3">
            <Input
              label="CEP"
              value={zipCode}
              onChange={handleZipCodeChange}
              onBlur={handleCepBlur}
              placeholder="00000-000"
              maxLength={9}
              className="h-11 text-base"
            />
            {loadingCep && (
              <p className="-mt-2 text-xs text-primary">Buscando endereço...</p>
            )}
            <Input
              label="Rua"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="h-11 text-base"
            />
            <div className="flex gap-3">
              <Input
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="h-11 w-24 shrink-0 text-base"
              />
              <Input
                label="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                placeholder="Opcional"
                className="h-11 flex-1 text-base"
              />
            </div>
            <Input
              label="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              required
              className="h-11 text-base"
            />
            <AddressCityStateSelect
              state={state}
              city={city}
              onStateChange={(uf) => setState(uf)}
              onCityChange={setCity}
              stateLabel="UF"
              cityLabel="Cidade"
              required
            />
            {storeDeliveryFee > 0 && (
              <p className="text-xs text-gray-500">
                Taxa: {formatCurrency(storeDeliveryFee)}
                {storeDeliveryDays && ` • Prazo: ${storeDeliveryDays} dia(s)`}
              </p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:static sm:z-auto sm:border-0 sm:bg-transparent sm:p-0 sm:pb-0 sm:backdrop-blur-none">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4 sm:flex-col sm:items-stretch sm:gap-3">
          <div className="min-w-0 sm:rounded-xl sm:border sm:border-gray-100 sm:bg-gray-50/50 sm:p-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(total)}</p>
          </div>
          <Button
            type="submit"
            disabled={loading || !isFormValid}
            className="h-12 min-w-[130px] shrink-0 text-base font-semibold sm:w-full"
          >
            {loading ? "Enviando..." : "Finalizar compra"}
          </Button>
        </div>
      </div>
    </form>
  );
}
