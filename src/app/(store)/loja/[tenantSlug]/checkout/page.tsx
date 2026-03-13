import Link from "next/link";
import { getPublicStoreWithProducts, getPublicStore } from "@/lib/store-public";
import { CheckoutForm } from "./CheckoutForm";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
  searchParams: Promise<{ productId?: string; cartId?: string }>;
};

export default async function CheckoutPage({ params, searchParams }: PageProps) {
  const { tenantSlug } = await params;
  const { productId, cartId } = await searchParams;
  const data = await getPublicStore(tenantSlug);
  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Loja não encontrada.</p>
        <Link href="/loja" className="text-primary hover:underline">
          Voltar
        </Link>
      </div>
    );
  }
  if (cartId) {
    return (
      <div>
        <Link
          href={`/loja/${tenantSlug}/carrinho`}
          className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar ao carrinho
        </Link>
        <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900">Finalizar compra</h1>
          {(data.store as { paymentMethods?: string }).paymentMethods && (
            <p className="mt-2 text-sm text-gray-600">
              Formas de pagamento:{" "}
              {(
                JSON.parse(
                  (data.store as { paymentMethods: string }).paymentMethods
                ) as string[]
              )
                .map((p) =>
                  p === "pix"
                    ? "PIX"
                    : p === "credit"
                      ? "Cartão"
                      : p === "boleto"
                        ? "Boleto"
                        : p === "cash"
                          ? "Dinheiro"
                          : "Retirada"
                )
                .join(", ")}
            </p>
          )}
          <CheckoutForm
            tenantId={data.tenantId}
            storeId={data.store.id}
            cartId={cartId}
          />
        </div>
      </div>
    );
  }
  if (!productId) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Nenhum produto ou carrinho selecionado.</p>
        <Link href={`/loja/${tenantSlug}`} className="text-primary hover:underline">
          Voltar à loja
        </Link>
      </div>
    );
  }
  const productsData = await getPublicStoreWithProducts(tenantSlug);
  const product = productsData?.products.find((p) => p.id === productId);
  if (!product) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Produto não encontrado.</p>
        <Link href={`/loja/${tenantSlug}`} className="text-primary hover:underline">
          Voltar à loja
        </Link>
      </div>
    );
  }
  const price = Number(product.price);
  return (
    <div>
      <Link
        href={`/loja/${tenantSlug}/produtos/${product.slug}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Voltar ao produto
      </Link>
      <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Finalizar compra</h1>
        <div className="mt-4 rounded-lg bg-gray-50 p-4">
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="mt-1 text-lg font-bold text-primary">
            R$ {price.toFixed(2)}
          </p>
        </div>
        <CheckoutForm
          tenantId={data.tenantId}
          storeId={data.store.id}
          productId={product.id}
          productName={product.name}
          total={price}
        />
      </div>
    </div>
  );
}
