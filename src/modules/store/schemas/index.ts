import { z } from "zod";

const themeEnum = z.enum(["default", "purple", "green", "amber"]);
const paymentMethodEnum = z.enum(["pix", "credit", "boleto", "cash", "pickup"]);
const deliveryTypeEnum = z.enum(["pickup", "delivery", "both"]);

export const createStoreSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  theme: themeEnum.optional().default("default"),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  contactEmail: z.string().email().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  paymentMethods: z
    .array(paymentMethodEnum)
    .optional()
    .nullable()
    .transform((v) => (v?.length ? JSON.stringify(v) : null)),
  deliveryType: deliveryTypeEnum.optional().nullable(),
  deliveryFee: z.coerce.number().min(0).optional().nullable(),
  deliveryDays: z.coerce.number().int().min(1).optional().nullable(),
  tenantId: z.string().min(1),
});

export const updateStoreSchema = createStoreSchema.partial().omit({ tenantId: true });

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
