"use client";

import { useRef, useState } from "react";

type ImageUploadProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  tenantId: string;
  placeholder?: string;
};

export function ImageUpload({
  label,
  value,
  onChange,
  tenantId,
  placeholder = "Selecionar imagem",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/tenants/${tenantId}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao enviar");
        return;
      }

      if (data.url) onChange(data.url);
    } catch {
      setError("Erro de conexão");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        {value && (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white hover:bg-red-600"
              aria-label="Remover"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Enviando..." : value ? "Trocar" : placeholder}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        JPEG, PNG, WebP ou GIF. Máximo 2MB.
      </p>
    </div>
  );
}
