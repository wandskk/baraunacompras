import Link from "next/link";

type Props = {
  tenantSlug: string;
  storeName: string;
  description?: string | null;
  bannerUrl?: string | null;
};

export function StoreHero({ tenantSlug, storeName, description, bannerUrl }: Props) {
  return (
    <section
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent py-12 sm:py-16"
      aria-label="Banner da loja"
    >
      {bannerUrl && (
        <>
          <img
            src={bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/65" aria-hidden />
        </>
      )}
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <h1
          className={`text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl ${
            bannerUrl ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" : "text-gray-900"
          }`}
        >
          {storeName}
        </h1>
        <p
          className={`mt-2 sm:text-lg ${
            bannerUrl ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" : "text-gray-600"
          }`}
        >
          {description ?? "Confira nossos produtos"}
        </p>
        <Link
          href="#produtos"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Ver produtos
        </Link>
      </div>
    </section>
  );
}
