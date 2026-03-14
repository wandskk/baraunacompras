/**
 * Dados do comprador salvos em localStorage.
 * Compartilhados entre todas as lojas do domínio.
 */
export type BuyerAddress = {
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type BuyerData = {
  email: string;
  name?: string;
  phone?: string;
  address?: BuyerAddress;
};

const STORAGE_KEY = "baraunacompras_buyer";

export function getBuyerData(): BuyerData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as BuyerData;
    if (typeof data !== "object" || !data.email) return null;
    return {
      email: data.email,
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
    };
  } catch {
    return null;
  }
}

export function setBuyerData(data: BuyerData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignora falha (quota, privacidade, etc.)
  }
}
