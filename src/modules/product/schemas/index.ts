import { z } from "zod";

const baseProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  price: z.coerce.number().positive("Preço deve ser maior que zero"),
  promotionalPrice: z.coerce.number().positive("Preço promocional deve ser maior que zero").optional().nullable(),
  promotionEndsAt: z.coerce.date().optional().nullable(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo").default(0),
  minStock: z.coerce.number().int().min(0, "Estoque mínimo não pode ser negativo").default(0),
  variations: z.array(z.string().min(1)).optional().default([]),
  sizes: z.array(z.string().min(1)).optional().default([]),
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
  categoryId: z.string().optional(),
});

export const createProductSchema = baseProductSchema
  .refine(
    (data) => {
      const endsAt = data.promotionEndsAt;
      if (!endsAt) return true;
      return endsAt >= new Date();
    },
    { message: "Data de expiração deve ser hoje ou uma data futura (válida até 23:59:59)", path: ["promotionEndsAt"] },
  )
  .refine(
    (data) => {
      const promo = data.promotionalPrice;
      if (promo == null || promo <= 0) return true;
      return promo < data.price;
    },
    { message: "Preço promocional deve ser menor que o preço normal", path: ["promotionalPrice"] },
  );

export const updateProductSchema = baseProductSchema
  .partial()
  .omit({ tenantId: true })
  .refine(
    (data) => {
      const endsAt = data.promotionEndsAt;
      if (!endsAt) return true;
      return endsAt >= new Date();
    },
    { message: "Data de expiração deve ser hoje ou uma data futura (válida até 23:59:59)", path: ["promotionEndsAt"] },
  )
  .refine(
    (data) => {
      const promo = data.promotionalPrice;
      if (promo == null || promo <= 0) return true;
      const price = data.price;
      if (price == null) return true;
      return promo < price;
    },
    { message: "Preço promocional deve ser menor que o preço normal", path: ["promotionalPrice"] },
  );

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
