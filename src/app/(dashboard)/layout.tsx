import { DashboardThemeWrapper } from "@/components/DashboardThemeWrapper";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardThemeWrapper>
      <DashboardHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </DashboardThemeWrapper>
  );
}
