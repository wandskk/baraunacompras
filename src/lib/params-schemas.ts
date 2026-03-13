import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const tenantIdParamSchema = z.object({
  tenantId: z.string().min(1, "tenantId is required"),
});

export const storeParamsSchema = tenantIdParamSchema.extend({
  storeId: z.string().min(1, "storeId is required"),
});

export const categoryParamsSchema = tenantIdParamSchema.extend({
  categoryId: z.string().min(1, "categoryId is required"),
});

export const productParamsSchema = storeParamsSchema.extend({
  productId: z.string().min(1, "productId is required"),
});

export const cartParamsSchema = storeParamsSchema.extend({
  cartId: z.string().min(1, "cartId is required"),
});

export const cartItemParamsSchema = cartParamsSchema.extend({
  productId: z.string().min(1, "productId is required"),
});

export const orderParamsSchema = storeParamsSchema.extend({
  orderId: z.string().min(1, "orderId is required"),
});

export const customerParamsSchema = storeParamsSchema.extend({
  customerId: z.string().min(1, "customerId is required"),
});

export const tenantSlugParamSchema = z.object({
  tenantSlug: z.string().min(1, "tenantSlug is required"),
});

export const publicProductParamsSchema = tenantSlugParamSchema.extend({
  productSlug: z.string().min(1, "productSlug is required"),
});
