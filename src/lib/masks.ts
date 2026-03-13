export type MaskType = "cep" | "phone" | "currency" | "integer";

export function applyMask(value: string, mask: MaskType): string {
  const digits = value.replace(/\D/g, "");
  switch (mask) {
    case "cep":
      return digits
        .slice(0, 8)
        .replace(/(\d{5})(\d{0,3})/, (_, a, b) => (b ? `${a}-${b}` : a));
    case "phone": {
      const d = digits.slice(0, 11);
      if (d.length <= 2) return d ? `(${d}` : "";
      if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    case "currency": {
      if (digits.length === 0) return "";
      const cents = parseInt(digits, 10) / 100;
      return cents.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    case "integer":
      return digits;
    default:
      return value;
  }
}

export function unmask(value: string, mask: MaskType): string {
  if (mask === "currency") {
    const digits = value.replace(/\D/g, "");
    return digits ? String(parseInt(digits, 10) / 100) : "";
  }
  return value.replace(/\D/g, "");
}

export function parseCurrencyToNumber(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
}

export function formatNumberToCurrency(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
