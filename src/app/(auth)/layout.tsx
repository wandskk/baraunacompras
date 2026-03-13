export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white via-[#FCD000]/5 to-[#2F8743]/10 p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
