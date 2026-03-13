"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
          <h1 className="text-xl font-semibold text-gray-900">Erro inesperado</h1>
          <p className="max-w-md text-center text-gray-600">
            Ocorreu um problema. Tente recarregar a página.
          </p>
          <button
            onClick={reset}
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
