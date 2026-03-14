"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

type AuthCardProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: { icon: React.ReactNode; label: string };
  linkText?: string;
  linkHref?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkHref?: string;
  /** Reduz paddings para caber em viewport em formulários multietapas */
  compact?: boolean;
  /** Indicador de etapas (ex: { current: 1, total: 2 }) */
  steps?: { current: number; total: number };
};

export function AuthCard({
  children,
  title,
  subtitle,
  badge,
  linkText = "Voltar à página inicial",
  linkHref = "/",
  footerText,
  footerLinkText,
  footerLinkHref,
  compact = false,
  steps,
}: AuthCardProps) {
  return (
    <article
      className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-xl shadow-primary/5 transition-all duration-300 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl animate-auth-card"
      role="article"
    >
      {/* Background gradient sutil - cores da logo */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/[0.08] via-transparent to-transparent pointer-events-none"
        aria-hidden
      />
      {/* Padrão decorativo leve */}
      <div
        className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(theme(colors.primary)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
        aria-hidden
      />

      <div
        className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto px-5 sm:px-8 md:px-10 ${compact ? "py-4 sm:py-5" : "py-6 sm:py-8 md:py-10"}`}
      >
        <Link
          href={linkHref}
          className="group inline-flex items-center gap-2 text-sm font-medium text-navy/80 transition-all hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded-lg px-2 py-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {linkText}
        </Link>

        {/* Logo - priorizando logo-nova, alinhada com a marca */}
        <div className={compact ? "mt-4 flex flex-col items-center sm:mt-5" : "mt-6 flex flex-col items-center sm:mt-8"}>
          <Image
            src="/logo-nova.png"
            alt="Baraúna Compras - Compras locais na palma da mão"
            width={180}
            height={56}
            className={compact ? "h-12 w-auto object-contain sm:h-14" : "h-14 w-auto object-contain sm:h-16"}
            priority
          />
        </div>

        {steps && steps.total > 1 && (
          <div
            className="mt-3 flex items-center justify-center gap-1.5"
            role="progressbar"
            aria-valuenow={steps.current}
            aria-valuemin={1}
            aria-valuemax={steps.total}
            aria-label={`Etapa ${steps.current} de ${steps.total}`}
          >
            {Array.from({ length: steps.total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === steps.current
                    ? "w-6 bg-primary"
                    : i + 1 < steps.current
                      ? "w-1.5 bg-primary/60"
                      : "w-1.5 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}

        {badge && (
          <div
            className={compact ? "mt-3 flex items-center justify-center gap-2 rounded-full bg-primary/10 px-3 py-2 sm:mt-4" : "mt-6 flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2.5 sm:mt-8"}
            role="status"
          >
            <span className="text-primary">{badge.icon}</span>
            <span className="text-sm font-semibold text-primary">
              {badge.label}
            </span>
          </div>
        )}

        <header className={compact ? "mt-3 text-center sm:mt-4" : "mt-6 text-center sm:mt-8"}>
          <h1 className={compact ? "text-lg font-bold text-navy sm:text-xl" : "text-xl font-bold text-navy sm:text-2xl md:text-3xl"}>
            {title}
          </h1>
          <p className={`text-sm text-gray-600 max-w-md mx-auto leading-relaxed ${compact ? "mt-1" : "mt-2 sm:text-base"}`}>
            {subtitle}
          </p>
        </header>

        <div className={compact ? "mt-4 flex-1 min-h-0 sm:mt-5" : "mt-6 sm:mt-8"}>{children}</div>

        {footerText && footerLinkText && footerLinkHref && (
          <p className={compact ? "mt-4 text-center text-sm text-gray-500 sm:mt-5" : "mt-6 text-center text-sm text-gray-500 sm:mt-8"}>
            {footerText}{" "}
            <Link
              href={footerLinkHref}
              className="font-semibold text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1 rounded"
            >
              {footerLinkText}
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}
