import { z } from "zod";

export const createOrderSchema = z.object({
  tenantId: z.string().min(1),
  storeId: z.string().min(1),
  customerId: z.string().optional(),
  total: z.coerce.number().nonnegative(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending"),
  paymentMethod: z.enum(["pix", "credit", "boleto", "cash"]).optional(),
  deliveryType: z.enum(["pickup", "delivery"]).optional(),
  deliveryFee: z.number().optional(),
  deliveryStreet: z.string().optional(),
  deliveryNumber: z.string().optional(),
  deliveryComplement: z.string().optional(),
  deliveryNeighborhood: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZipCode: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  customerId: z.string().optional().nullable(),
});

const deliveryAddressSchema = z.object({
  zipCode: z.string().min(8, "CEP inválido"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 caracteres"),
});

const phoneSchema = z
  .string()
  .transform((v) => v?.replace(/\D/g, "") ?? "")
  .refine((v) => v.length >= 10 && v.length <= 11, "Celular deve ter 10 ou 11 dígitos");

export const checkoutSchema = z
  .object({
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    name: z.string().optional(),
    phone: phoneSchema,
    paymentMethod: z.enum(["pix", "credit", "boleto", "cash"]).optional(),
    productId: z.string().min(1),
    quantity: z.coerce.number().int().min(1).default(1),
    total: z.coerce.number().positive("Total inválido"),
    deliveryType: z.enum(["pickup", "delivery"]).default("pickup"),
    deliveryAddress: deliveryAddressSchema.optional(),
  })
  .refine((data) => data.deliveryType !== "delivery" || data.deliveryAddress, {
    message: "Endereço é obrigatório para entrega",
    path: ["deliveryAddress"],
  });

export const checkoutFromCartSchema = z
  .object({
    email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
    name: z.string().optional(),
    phone: phoneSchema,
    paymentMethod: z.enum(["pix", "credit", "boleto", "cash"]).optional(),
    cartId: z.string().min(1),
    deliveryType: z.enum(["pickup", "delivery"]).default("pickup"),
    deliveryAddress: deliveryAddressSchema.optional(),
  })
  .refine((data) => data.deliveryType !== "delivery" || data.deliveryAddress, {
    message: "Endereço é obrigatório para entrega",
    path: ["deliveryAddress"],
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
