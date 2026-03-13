import { cookies } from "next/headers";
import { getPublicStore } from "@/lib/store-public";
import { getSessionCookie, verifySessionToken } from "@/lib/jwt";

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
  const store = data.store as { logoUrl?: string | null };
  const themeClass = `theme-${data.store.theme ?? "default"}`;
  return (
    <div className={`min-h-screen bg-gray-50 ${themeClass}`}>
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <a href={`/loja/${tenantSlug}`} className="flex items-center gap-2">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={storeName}
                className="h-8 object-contain"
              />
            ) : null}
            <span className="text-lg font-bold text-primary">{storeName}</span>
          </a>
          <nav className="flex items-center gap-4">
            <a
              href={`/loja/${tenantSlug}`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Início
            </a>
            <a
              href={`/loja/${tenantSlug}/carrinho`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Carrinho
            </a>
            {isStoreOwner && (
              <a
                href="/dashboard"
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Dashboard
              </a>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
