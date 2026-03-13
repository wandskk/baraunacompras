import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  price: z.number().positive(),
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
  categoryId: z.string().optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .omit({ tenantId: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
