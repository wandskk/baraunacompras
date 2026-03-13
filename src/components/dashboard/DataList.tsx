import type { LucideIcon } from "lucide-react";

type DataListProps = {
  empty: boolean;
  emptyMessage: string;
  emptyIcon?: LucideIcon;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
};

export function DataList({
  empty,
  emptyMessage,
  emptyIcon: EmptyIcon,
  emptyAction,
  children,
}: DataListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {!empty ? (
        <ul className="divide-y divide-gray-200">{children}</ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {EmptyIcon && (
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <EmptyIcon className="h-6 w-6" />
            </div>
          )}
          <p className="text-gray-500">{emptyMessage}</p>
          {emptyAction && <div className="mt-4">{emptyAction}</div>}
        </div>
      )}
    </div>
  );
}
