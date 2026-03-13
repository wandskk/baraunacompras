import {
  LandingHeader,
  LandingHero,
  LojasCadastradasSection,
  BuscarProdutosSection,
  QuemSomosSection,
  ContatoSection,
  LandingFooter,
} from "@/components/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <LandingHeader />
      <LandingHero />
      <LojasCadastradasSection />
      <BuscarProdutosSection />
      <QuemSomosSection />
      <ContatoSection />
      <LandingFooter />
    </main>
  );
}
