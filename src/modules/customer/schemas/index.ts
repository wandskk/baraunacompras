import { z } from "zod";

const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .refine((v) => !v || (v.length >= 10 && v.length <= 11), "Celular deve ter 10 ou 11 dígitos");

export const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: phoneSchema.optional(),
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .omit({ tenantId: true, storeId: true });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
