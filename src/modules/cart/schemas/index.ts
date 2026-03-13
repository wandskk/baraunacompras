import { z } from "zod";

export const createCartSchema = z.object({
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
