import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-primary">Barauna Compras</h1>
      <p className="text-secondary-foreground">
        SaaS para lojas locais
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg border-2 border-primary px-4 py-2 font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
