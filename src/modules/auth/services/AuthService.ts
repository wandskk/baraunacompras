import { UserRepository } from "../repositories";
import { hashPassword, verifyPassword, isLegacyHash } from "@/lib/hash";
import type { RegisterInput, LoginInput } from "../schemas";
import type { AuthSession } from "../types";

export class AuthService {
  private repository = new UserRepository();

  async register(input: RegisterInput) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }
    const passwordHash = await hashPassword(input.password);
    const user = await this.repository.create({
      email: input.email,
      name: input.name,
      password: passwordHash,
      tenantId: input.tenantId,
    });
    return this.toAuthUser(user);
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const user = await this.repository.findByEmail(input.email);
    if (!user || !user.password) {
      throw new Error("Invalid credentials");
    }
    const isValid = await verifyPassword(input.password, user.password);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }
    if (user.password && isLegacyHash(user.password)) {
      const newHash = await hashPassword(input.password);
      await this.repository.updatePassword(user.id, newHash);
    }
    return {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
    };
  }

  async getProfile(userId: string, tenantId: string) {
    const user = await this.repository.findById(userId, tenantId);
    if (!user) {
      throw new Error("User not found");
    }
    return this.toAuthUser(user);
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string | null;
    password?: string | null;
  }) {
    const { password: _, ...rest } = user;
    return rest;
  }
}
