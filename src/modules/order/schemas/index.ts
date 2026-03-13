import { z } from "zod";

export const createOrderSchema = z.object({
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
  customerId: z.string().optional(),
  total: z.coerce.number().nonnegative(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  customerId: z.string().optional().nullable(),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  total: z.coerce.number().positive(),
});

export const checkoutFromCartSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  cartId: z.string().min(1),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
