import { z } from "zod";

const themeEnum = z.enum(["default", "purple", "green", "amber"]);
const paymentMethodEnum = z.enum(["pix", "credit", "boleto", "cash"]);
const deliveryTypeEnum = z.enum(["pickup", "delivery", "both"]);

const cepSchema = z
  .string()
  .transform((v) => v?.replace(/\D/g, "") ?? "")
  .refine((v) => !v || v.length === 8, "CEP deve ter 8 dígitos")
  .optional()
  .nullable();

const phoneSchema = z
  .string()
  .transform((v) => v?.replace(/\D/g, "") ?? "")
  .refine((v) => !v || (v.length >= 10 && v.length <= 11), "Telefone deve ter 10 ou 11 dígitos")
  .optional()
  .nullable();

export const createStoreSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  slug: z.string().min(1, "Slug é obrigatório").regex(/^[a-z0-9-]+$/, "Slug inválido"),
  theme: themeEnum.optional().default("default"),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  contactEmail: z.string().email("Email inválido").optional().nullable(),
  contactPhone: phoneSchema,
  contactPhoneIsWhatsApp: z.boolean().optional().default(false),
  paymentMethods: z
    .array(paymentMethodEnum)
    .optional()
    .nullable()
    .transform((v) => (v?.length ? JSON.stringify(v) : null)),
  deliveryType: deliveryTypeEnum.optional().nullable(),
  deliveryFee: z.coerce.number().min(0, "Taxa deve ser positiva").optional().nullable(),
  deliveryDays: z.coerce.number().int().min(1, "Dias deve ser positivo").optional().nullable(),
  addressStreet: z.string().optional().nullable(),
  addressNumber: z.string().optional().nullable(),
  addressComplement: z.string().optional().nullable(),
  addressNeighborhood: z.string().optional().nullable(),
  addressCity: z.string().optional().nullable(),
  addressState: z.string().max(2, "UF deve ter 2 caracteres").optional().nullable(),
  addressZipCode: cepSchema,
  tenantId: z.string().min(1),
});

export const updateStoreSchema = createStoreSchema.partial().omit({ tenantId: true });

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
