"use client";

import type { InputHTMLAttributes } from "react";
import { applyMask, type MaskType } from "@/lib/masks";
import { Input } from "./Input";

type MaskedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label?: string;
  error?: string;
  mask: MaskType;
  onChange: (e: React.ChangeEvent<HTMLInputElement> & { target: { value: string } }) => void;
  value: string;
};

export function MaskedInput({
  label,
  error,
  mask,
  onChange,
  value,
  ...props
}: MaskedInputProps) {
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = applyMask(e.target.value, mask);
    onChange({ ...e, target: { ...e.target, value: masked } });
  }

  return (
    <Input
      label={label}
      error={error}
      value={value}
      onChange={handleChange}
      {...props}
    />
  );
}
