"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui";

type Props = {
  label: string;
  activateLabel: string;
  options: string[];
  onChange: (options: string[]) => void;
  placeholder?: string;
};

export function OptionListField({
  label,
  activateLabel,
  options,
  onChange,
  placeholder = "Digite e pressione Enter ou clique em Adicionar",
}: Props) {
  const [active, setActive] = useState(options.length > 0);
  const [inputValue, setInputValue] = useState("");

  function handleAdd() {
    const value = inputValue.trim();
    if (!value) return;
    if (options.includes(value)) {
      setInputValue("");
      return;
    }
    onChange([...options, value]);
    setInputValue("");
  }

  function handleRemove(index: number) {
    onChange(options.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  if (!active) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setActive(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          {activateLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            {opt}
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
              aria-label={`Remover ${opt}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}
