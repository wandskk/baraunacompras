import { z } from "zod";

export const createCartSchema = z.object({
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
});

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0),
});

export type CreateCartInput = z.infer<typeof createCartSchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
