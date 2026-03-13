import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0).default(0),
  variations: z.array(z.string().min(1)).optional().default([]),
  sizes: z.array(z.string().min(1)).optional().default([]),
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
  categoryId: z.string().optional(),
});

export const updateProductSchema = createProductSchema
  .partial()
  .omit({ tenantId: true });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
