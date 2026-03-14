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
    <div className="space-y-4 sm:space-y-6">
      <Link
        href={`/dashboard/stores/${storeId}`}
        className="inline-flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-700 sm:gap-1.5 sm:text-sm"
      >
        <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Voltar à loja
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="text-lg font-bold tracking-tight text-gray-900 sm:text-2xl">
          {title}
        </h1>
        {actions}
      </div>
      {children}
    </div>
  );
}
