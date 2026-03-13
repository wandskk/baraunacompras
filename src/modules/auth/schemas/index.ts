import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  name: z.string().optional(),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  tenantId: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
