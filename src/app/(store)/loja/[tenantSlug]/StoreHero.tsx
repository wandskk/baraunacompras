import Link from "next/link";

type Props = {
  tenantSlug: string;
  storeName: string;
  description?: string | null;
};

export function StoreHero({ tenantSlug, storeName, description }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-12 sm:py-16"
      aria-label="Banner da loja"
    >
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
          {storeName}
        </h1>
        <p className="mt-2 text-gray-600 sm:text-lg">
          {description ?? "Confira nossos produtos"}
        </p>
        <Link
          href={`#produtos`}
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
        >
          Ver produtos
        </Link>
      </div>
    </section>
  );
}
