"use client";

import { useState } from "react";
import { Button, Input } from "@/components/ui";

type CheckoutFormProps = {
  tenantId: string;
  storeId: string;
  productId: string;
  productName: string;
  total: number;
};

export function CheckoutForm({
  tenantId,
  storeId,
  productId,
  total,
}: CheckoutFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tenants/${tenantId}/stores/${storeId}/checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            name: name || undefined,
            productId,
            total,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao finalizar compra");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-6 rounded-lg bg-accent/10 p-4 text-center">
        <p className="font-medium text-accent">Pedido realizado com sucesso!</p>
        <p className="mt-1 text-sm text-gray-600">
          Você receberá a confirmação por email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <Input
        label="Nome (opcional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="name"
      />
      {error && (
        <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>
      )}
      <Button type="submit" fullWidth disabled={loading}>
        {loading ? "Processando..." : "Finalizar compra"}
      </Button>
    </form>
  );
}
