"use client";

type AuthFormSectionProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function AuthFormSection({ title, icon, children }: AuthFormSectionProps) {
  return (
    <div
      className="rounded-xl border border-navy/8 bg-white/60 p-4 shadow-sm transition-all duration-200 hover:border-primary/15 hover:shadow-primary/5 sm:p-5"
      role="group"
    >
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy sm:mb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {title}
      </p>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </div>
  );
}
