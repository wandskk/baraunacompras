import Link from "next/link";

type DataListItemProps = {
  href?: string;
  variant?: "default" | "promotion";
  children: React.ReactNode;
};

export function DataListItem({ href, variant = "default", children }: DataListItemProps) {
  const baseClass =
    "flex items-center justify-between gap-4 px-6 py-4 transition-colors rounded-lg";
  const isPromotion = variant === "promotion";
  const variantClass = isPromotion
    ? "border-2 border-amber-400/60 bg-amber-50/80 hover:bg-amber-100/80"
    : "";
  const interactiveClass = href
    ? isPromotion
      ? "hover:bg-amber-100/80 focus-visible:bg-amber-100/80"
      : "hover:bg-gray-50 focus-visible:bg-gray-50"
    : "";

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className={`${baseClass} ${variantClass} ${interactiveClass}`}
        >
          {children}
        </Link>
      </li>
    );
  }

  return <li className={`${baseClass} ${variantClass}`}>{children}</li>;
}
