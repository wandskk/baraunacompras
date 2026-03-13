import { Nunito } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-nunito",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={nunito.variable}>
      <body className={`${nunito.className} min-h-screen antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              border: "none",
              padding: 0,
              background: "transparent",
              boxShadow: "none",
            },
          }}
        />
      </body>
    </html>
  );
}
