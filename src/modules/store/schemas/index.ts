import { z } from "zod";

const themeEnum = z.enum(["default", "purple", "green", "amber"]);

export const createStoreSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  theme: themeEnum.optional().default("default"),
  tenantId: z.string().min(1),
});

export const updateStoreSchema = createStoreSchema.partial().omit({ tenantId: true });

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;
