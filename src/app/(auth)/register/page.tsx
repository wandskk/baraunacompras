"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFormSection } from "@/components/auth/AuthFormSection";
import { slugify } from "@/lib/slugify";
import { Store, UserPlus, ArrowRight, ArrowLeft } from "lucide-react";

const STEPS = [
  {
    id: "org",
    title: "Sua organização",
    subtitle: "Cadastre sua loja na plataforma.",
    badge: { icon: <Store className="h-4 w-4" />, label: "Etapa 1" },
  },
  {
    id: "dados",
    title: "Seus dados",
    subtitle: "Crie seu acesso para gerenciar a loja.",
    badge: { icon: <UserPlus className="h-4 w-4" />, label: "Etapa 2" },
  },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tenantName, setTenantName] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleTenantNameChange(value: string) {
    setTenantName(value);
    setTenantSlug(slugify(value));
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    setStep(2);
  }

  function handleBack() {
    setError("");
    setStep(1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const tenantRes = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tenantName, slug: tenantSlug }),
        credentials: "include",
      });
      const tenantData = await tenantRes.json();
      if (!tenantRes.ok) {
        setError(tenantData.error ?? "Erro ao criar organização");
        return;
      }
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          password,
          tenantId: tenantData.id,
        }),
        credentials: "include",
      });
      const userData = await registerRes.json();
      if (!registerRes.ok) {
        setError(userData.error ?? "Erro ao criar conta");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = STEPS[step - 1];

  return (
    <AuthCard
      title={currentStep.title}
      subtitle={currentStep.subtitle}
      badge={currentStep.badge}
      footerText="Já tem conta?"
      footerLinkText="Entrar"
      footerLinkHref="/login"
      compact
      steps={{ current: step, total: STEPS.length }}
    >
      <form
        onSubmit={step === 2 ? handleSubmit : handleNext}
        className="flex min-h-0 flex-col"
      >
        <div
          className={`space-y-4 transition-opacity duration-300 ${
            step === 1 ? "block" : "hidden"
          }`}
        >
          <AuthFormSection
            title="Dados da loja"
            icon={<Store className="h-4 w-4" />}
          >
            <Input
              label="Nome da organização"
              value={tenantName}
              onChange={(e) => handleTenantNameChange(e.target.value)}
              required
              placeholder="Minha Loja"
              autoComplete="organization"
            />
            <Input
              label="Slug (URL da loja)"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              required
              placeholder="minha-loja"
            />
          </AuthFormSection>
        </div>

        <div
          className={`space-y-4 transition-opacity duration-300 ${
            step === 2 ? "block" : "hidden"
          }`}
        >
          <AuthFormSection
            title="Dados de acesso"
            icon={<UserPlus className="h-4 w-4" />}
          >
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={step === 1}
              autoComplete="email"
              placeholder="seu@email.com"
            />
            <Input
              label="Nome (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={step === 1}
              autoComplete="name"
              placeholder="Seu nome"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={step === 1}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />
          </AuthFormSection>
        </div>

        {error && (
          <div
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse sm:gap-3">
          {step === 1 ? (
            <Button
              type="submit"
              fullWidth
              className="h-11 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98] sm:flex-1"
            >
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className="h-11 flex-1 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-[0.98]"
              >
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="h-11 rounded-xl sm:shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </>
          )}
        </div>
      </form>
    </AuthCard>
  );
}
