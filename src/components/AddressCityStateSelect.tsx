"use client";

import { useEffect, useState } from "react";
import { fetchStates, fetchCitiesByStateId } from "@/lib/ibge";

const selectClassName =
  "h-11 w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:ring-offset-0";

type Props = {
  state: string;
  city: string;
  onStateChange: (uf: string) => void;
  onCityChange: (city: string) => void;
  stateLabel?: string;
  cityLabel?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
};

export function AddressCityStateSelect({
  state,
  city,
  onStateChange,
  onCityChange,
  stateLabel = "Estado",
  cityLabel = "Cidade",
  required,
  className = "",
  disabled,
}: Props) {
  const [states, setStates] = useState<{ id: number; sigla: string; nome: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; nome: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    fetchStates().then(setStates);
  }, []);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    const stateObj = states.find((s) => s.sigla === state.toUpperCase());
    if (!stateObj) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    fetchCitiesByStateId(stateObj.id)
      .then(setCities)
      .finally(() => setLoadingCities(false));
  }, [state, states]);

  function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const uf = e.target.value;
    onStateChange(uf);
    onCityChange("");
  }

  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <div className="w-full">
        <label
          htmlFor="address-state"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {stateLabel}
        </label>
        <select
          id="address-state"
          value={state.toUpperCase()}
          onChange={handleStateChange}
          required={required}
          disabled={disabled}
          className={selectClassName}
        >
          <option value="">Selecione</option>
          {states.map((s) => (
            <option key={s.id} value={s.sigla}>
              {s.sigla}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full">
        <label
          htmlFor="address-city"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {cityLabel}
        </label>
        <select
          id="address-city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          required={required}
          disabled={disabled || !state || loadingCities}
          className={selectClassName}
        >
          <option value="">{loadingCities ? "Carregando..." : "Selecione"}</option>
          {city &&
            !cities.some((c) => c.nome.toLowerCase() === city.toLowerCase()) && (
              <option value={city}>{city}</option>
            )}
          {cities.map((c) => (
            <option key={c.id} value={c.nome}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
