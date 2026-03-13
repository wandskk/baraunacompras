type LoadingSpinnerProps = {
  /** Mensagem exibida abaixo do spinner */
  message?: string;
  /** Altura mínima do container (ex: "280px", "200px") */
  minHeight?: string;
  /** Tamanho do spinner: "sm" | "md" | "lg" */
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export function LoadingSpinner({
  message = "Carregando...",
  minHeight = "280px",
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]}`}
        />
        {message && (
          <p className="text-sm text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
}
