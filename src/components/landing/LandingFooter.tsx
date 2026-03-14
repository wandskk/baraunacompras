import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  navegacao: [
    { href: "#lojas-cadastradas", label: "Lojas Cadastradas" },
    { href: "#buscar-produtos", label: "Buscar Produtos" },
    { href: "#quem-somos", label: "Quem Somos" },
    { href: "#contato", label: "Contato" },
  ],
  plataforma: [
    { href: "/loja", label: "Explorar Lojas" },
    { href: "/login", label: "Entrar" },
    { href: "/register", label: "Criar conta" },
  ],
};

export function LandingFooter() {
  return (
    <footer className="border-t border-[#202C59]/10 bg-[#202C59] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo-nova.png"
                alt="Baraúna Compras"
                width={140}
                height={42}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-sm text-white/80">
              Compras locais na palma da mão. Conectando Baraúna ao comércio
              digital.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Navegação</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.navegacao.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Plataforma</h4>
            <ul className="mt-4 space-y-2">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-8">
          <p className="text-center text-sm text-white/60">
            © {new Date().getFullYear()} Baraúna Compras. Feito com as cores de
            Baraúna para nossa cidade.
          </p>
        </div>
      </div>
    </footer>
  );
}
