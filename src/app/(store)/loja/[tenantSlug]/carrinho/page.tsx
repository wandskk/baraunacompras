import Link from "next/link";
import { getPublicStore } from "@/lib/store-public";
import { CartContent } from "./CartContent";

type PageProps = {
  params: Promise<{ tenantSlug: string }>;
};

export default async function CartPage({ params }: PageProps) {
  const { tenantSlug } = await params;
  const data = await getPublicStore(tenantSlug);
  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Loja não encontrada</p>
        <Link href="/loja" className="text-primary hover:underline">
          Voltar
        </Link>
      </div>
    );
  }
  return (
    <div>
      <Link
        href={`/loja/${tenantSlug}`}
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Continuar comprando
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Carrinho</h1>
      <CartContent
        tenantSlug={tenantSlug}
        tenantId={data.tenantId}
        storeId={data.store.id}
      />
    </div>
  );
}
