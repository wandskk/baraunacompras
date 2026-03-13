import Link from "next/link";

export default function LojaPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-gray-900">Lojas</h1>
      <p className="mt-2 text-center text-gray-500">
        Acesse uma loja pelo link enviado pelo dono, por exemplo: /loja/nome-da-loja
      </p>
      <Link
        href="/"
        className="mt-6 text-primary hover:underline"
      >
        ← Voltar ao início
      </Link>
    </div>
  );
}
