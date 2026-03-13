import Link from "next/link";

type DataListItemProps = {
  href?: string;
  children: React.ReactNode;
};

export function DataListItem({ href, children }: DataListItemProps) {
  const baseClass =
    "flex items-center justify-between gap-4 px-6 py-4 transition-colors";
  const interactiveClass = href
    ? "hover:bg-gray-50 focus-visible:bg-gray-50"
    : "";

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className={`${baseClass} ${interactiveClass}`}
        >
          {children}
        </Link>
      </li>
    );
  }

  return <li className={`${baseClass}`}>{children}</li>;
}
