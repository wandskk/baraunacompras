"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui";
import { useSession } from "@/hooks/useSession";

export function DashboardHeader() {
  const router = useRouter();
  const { logout } = useSession();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          Barauna Compras
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Lojas
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </Button>
        </nav>
      </div>
    </header>
  );
}
