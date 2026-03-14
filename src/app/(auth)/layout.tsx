export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 max-h-dvh items-center justify-center overflow-y-auto bg-gradient-to-br from-white via-secondary/5 to-primary/10 p-4 sm:p-6">
      {/* Background pattern - identidade Baraúna */}
      <div
        className="fixed inset-0 opacity-[0.04] [background-image:radial-gradient(theme(colors.primary)_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none"
        aria-hidden
      />
      <div className="relative my-auto w-full max-w-md flex-shrink-0 sm:max-w-lg md:max-w-xl">
        {children}
      </div>
    </div>
  );
}
