import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email é obrigatório")
  .email("Email inválido");

export const passwordSchema = z
  .string()
  .min(6, "Senha deve ter no mínimo 6 caracteres");

export const cepSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => v.length === 0 || v.length === 8, "CEP deve ter 8 dígitos")
  .optional()
  .nullable();

export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine(
    (v) => v.length === 0 || (v.length >= 10 && v.length <= 11),
    "Telefone deve ter 10 ou 11 dígitos"
  )
  .optional()
  .nullable();

export const currencySchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? parseFloat(v.replace(/\D/g, "")) / 100 : v))
  .refine((v) => !isNaN(v) && v >= 0, "Valor inválido");

export const positiveNumberSchema = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? parseFloat(v.replace(/\D/g, "")) : v))
  .refine((v) => !isNaN(v) && v >= 0, "Deve ser um número positivo");

export const slugSchema = z
  .string()
  .min(1, "Slug é obrigatório")
  .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens");

export const requiredString = (field: string) =>
  z.string().min(1, `${field} é obrigatório`);
