export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits.replace(/(\d{5})/, "$1-");
  }
  return digits.replace(/(\d{5})(\d{0,3})/, "$1-$2");
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) {
    return digits.replace(/(\d{0,2})/, "($1");
  }
  if (digits.length <= 6) {
    return digits.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export function formatNumber(value: number | string, decimals = 0): string {
  const num = typeof value === "string" ? parseFloat(value) || 0 : value;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
