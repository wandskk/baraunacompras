import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type StoreListPageLayoutProps = {
  storeId: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function StoreListPageLayout({
  storeId,
  title,
  actions,
  children,
}: StoreListPageLayoutProps) {
  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/stores/${storeId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar à loja
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        {actions}
      </div>
      {children}
    </div>
  );
}
