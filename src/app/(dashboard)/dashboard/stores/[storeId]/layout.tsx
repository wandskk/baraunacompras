import { prisma } from "@/database/prisma";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ storeId: string }>;
};

export default async function StoreDashboardLayout({
  children,
  params,
}: LayoutProps) {
  const { storeId } = await params;
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { theme: true },
  });

  const themeClass = store?.theme
    ? `theme-${store.theme}`
    : "theme-default";

  return (
    <div className={`min-h-full ${themeClass}`}>{children}</div>
  );
}
