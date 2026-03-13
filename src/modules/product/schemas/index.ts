import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo").default(0),
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
