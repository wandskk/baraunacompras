import { z } from "zod";

export const createCustomerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
});

export const updateCustomerSchema = createCustomerSchema
  .partial()
  .omit({ tenantId: true, storeId: true });

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
