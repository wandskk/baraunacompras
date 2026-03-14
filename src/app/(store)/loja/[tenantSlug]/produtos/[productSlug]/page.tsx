import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getEffectivePrice, isProductOnPromotion } from "@/lib/product-price";
import {
  getPublicProduct,
  getPublicStore,
  getRelatedProducts,
  isProductAvailable,
} from "@/lib/store-public";
import { ProductPurchaseSection } from "./ProductPurchaseSection";
import { StoreProductCard } from "../../StoreProductCard";

type PageProps = {
  params: Promise<{ tenantSlug: string; productSlug: string }>;
};

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default async function ProductPage({ params }: PageProps) {
  const { tenantSlug, productSlug } = await params;
  const [product, storeData] = await Promise.all([
    getPublicProduct(tenantSlug, productSlug),
    getPublicStore(tenantSlug),
  ]);
  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
        <p className="text-gray-500">Produto não encontrado</p>
        <Link
          href={`/loja/${tenantSlug}`}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          Voltar aos produtos
        </Link>
      </div>
    );
  }
  const available = isProductAvailable(product);
  const store = storeData?.store as {
    contactPhone?: string | null;
    contactPhoneIsWhatsApp?: boolean;
    name?: string;
  } | undefined;
  const whatsappPhone = store?.contactPhone && store?.contactPhoneIsWhatsApp
    ? store.contactPhone.replace(/\D/g, "")
    : null;
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/55${whatsappPhone}?text=${encodeURIComponent(`Olá! Tenho dúvidas sobre o produto: ${product.name}`)}`
    : null;
  const stock = product.stock ?? 0;
  const price = getEffectivePrice(product);
  const onPromo = isProductOnPromotion(product);
  const originalPrice = onPromo ? Number(product.price) : null;
  const relatedProducts = await getRelatedProducts(
    tenantSlug,
    product.id,
    product.categoryId,
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Navegação">
        <Link
          href={`/loja/${tenantSlug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Voltar aos produtos
        </Link>
      </nav>

      {/* Product card */}
      <article className={`overflow-hidden rounded-2xl border shadow-sm ${onPromo ? "border-amber-400/70 bg-amber-50/30" : "border-gray-200 bg-white"}`}>
        <div className="grid gap-6 p-6 sm:gap-8 sm:p-8 lg:grid-cols-2 lg:gap-12">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 lg:aspect-4/5">
            {onPromo && (
              <span className="absolute left-4 top-4 z-10 rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-bold text-black shadow-md">
                PROMO
              </span>
            )}
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary">
                <span className="text-8xl text-secondary-foreground/30">
                  📦
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.category && (
              <Link
                href={`/loja/${tenantSlug}?categoryId=${product.category.id}`}
                className="text-xs font-medium uppercase tracking-wider text-primary hover:underline"
              >
                {product.category.name}
              </Link>
            )}
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div>
                <p className={`text-3xl font-bold ${onPromo ? "text-amber-800" : "text-primary"}`}>
                  {formatCurrency(price)}
                </p>
                {originalPrice != null && originalPrice > price && (
                  <p className="mt-0.5 text-lg text-gray-500 line-through">
                    De {formatCurrency(originalPrice)}
                  </p>
                )}
              </div>
              {available ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                  Em estoque{stock > 1 ? ` (${stock} unidades)` : ""}
                </span>
              ) : (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-600">
                  Indisponível
                </span>
              )}
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-100"
              >
                <MessageCircle className="h-4 w-4" />
                Tirar dúvidas no WhatsApp
              </a>
            )}
            <div className="mt-6">
              <ProductPurchaseSection
                tenantSlug={tenantSlug}
                product={product}
                available={available}
              />
            </div>

            {product.description && (
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                  Descrição
                </h2>
                <p className="mt-3 text-sm font-medium whitespace-pre-line text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Produtos da mesma categoria */}
      <section className="pt-6 sm:pt-8">
        {relatedProducts.length > 0 ? (
          <>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 sm:text-xl">
              {product.category
                ? `Mais em ${product.category.name}`
                : "Outros produtos"}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.map((p) => {
                const pAvailable = isProductAvailable(p);
                return (
                  <StoreProductCard
                    key={p.id}
                    tenantSlug={tenantSlug}
                    product={p}
                    available={pAvailable}
                  />
                );
              })}
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                href={`/loja/${tenantSlug}${product.category ? `?categoryId=${product.category.id}` : ""}`}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Ver mais produtos
              </Link>
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <Link
              href={`/loja/${tenantSlug}`}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Ver mais produtos
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
