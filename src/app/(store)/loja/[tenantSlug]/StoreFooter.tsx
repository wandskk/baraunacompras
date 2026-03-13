import type { ReactNode } from "react";
import { formatPhone } from "@/lib/format";

type Props = {
  storeName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
};

function IconWrapper({ children }: { children: ReactNode }) {
  return <span className="flex h-5 w-5 shrink-0 items-center justify-center text-gray-500">{children}</span>;
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function StoreFooter({
  storeName,
  contactEmail,
  contactPhone,
}: Props) {
  const whatsappUrl = contactPhone
    ? `https://wa.me/55${contactPhone.replace(/\D/g, "")}`
    : null;

  return (
    <footer className="w-full border-t border-gray-200 bg-white/80 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-8">
          <div>
            <h3 className="font-semibold text-gray-900">{storeName}</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-2 hover:text-gray-900"
                >
                  <IconWrapper><PhoneIcon /></IconWrapper>
                  {formatPhone(contactPhone)}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 hover:text-gray-900"
                >
                  <IconWrapper><MailIcon /></IconWrapper>
                  {contactEmail}
                </a>
              )}
              <div className="flex items-center gap-2 text-gray-500">
                <IconWrapper><MapPinIcon /></IconWrapper>
                <span>Entre em contato para mais informações</span>
              </div>
            </div>
          </div>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700"
            >
              <span aria-hidden>💬</span>
              WhatsApp
            </a>
          )}
        </div>
        <p className="mt-6 flex justify-center text-center text-xs text-gray-500 sm:justify-start">
          © {new Date().getFullYear()} {storeName}
        </p>
      </div>
    </footer>
  );
}
