import { cookies } from "next/headers";
import { getPublicStore } from "@/lib/store-public";
import { getSessionCookie, verifySessionToken } from "@/lib/jwt";
import { StoreNav } from "./StoreNav";
import { StoreFooter } from "./StoreFooter";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
};

export default async function StoreLayout({ children, params }: LayoutProps) {
  const { tenantSlug } = await params;
  const data = await getPublicStore(tenantSlug);
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loja não encontrada</p>
      </div>
    );
  }

  let isStoreOwner = false;
  const cookieStore = await cookies();
  const token = cookieStore.get(getSessionCookie())?.value;
  if (token) {
    const payload = await verifySessionToken(token);
    if (payload && payload.tenantId === data.tenantId) {
      isStoreOwner = true;
    }
  }

  const storeName = data.store.name;
  const store = data.store as { logoUrl?: string | null; contactEmail?: string | null; contactPhone?: string | null };
  const themeClass = `theme-${data.store.theme ?? "default"}`;
  return (
    <div className={`flex min-h-screen flex-col bg-gray-50 ${themeClass}`}>
      <StoreNav
        tenantSlug={tenantSlug}
        storeName={storeName}
        storeId={data.store.id}
        logoUrl={store.logoUrl}
        isStoreOwner={isStoreOwner}
      />
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
      </main>
      <StoreFooter
        storeName={storeName}
        contactEmail={store.contactEmail}
        contactPhone={store.contactPhone}
      />
    </div>
  );
}
