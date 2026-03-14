/**
 * API IBGE - Estados e municípios do Brasil
 * https://servicodados.ibge.gov.br/api/docs/localidades
 */

export type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeCity = {
  id: number;
  nome: string;
};

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function fetchStates(): Promise<IbgeState[]> {
  const res = await fetch(`${IBGE_BASE}/estados?orderBy=nome`);
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}

export async function fetchCitiesByStateId(stateId: number): Promise<IbgeCity[]> {
  const res = await fetch(`${IBGE_BASE}/estados/${stateId}/municipios?orderBy=nome`);
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}
