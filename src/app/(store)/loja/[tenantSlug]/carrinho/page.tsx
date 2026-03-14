import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
    <div className="min-h-[60vh]">
      <Link
        href={`/loja/${tenantSlug}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        Continuar comprando
      </Link>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-navy sm:text-3xl">
        Carrinho
      </h1>
      <CartContent
        tenantSlug={tenantSlug}
        tenantId={data.tenantId}
        storeId={data.store.id}
      />
    </div>
  );
}
