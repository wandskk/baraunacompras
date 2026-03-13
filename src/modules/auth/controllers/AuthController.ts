import { AuthService } from "../services";
import { registerSchema, loginSchema } from "../schemas";

export class AuthController {
  private service = new AuthService();

  async register(body: unknown) {
    const input = registerSchema.parse(body);
    return this.service.register(input);
  }

  async login(body: unknown) {
    const input = loginSchema.parse(body);
    return this.service.login(input);
  }

  async getProfile(userId: string, tenantId: string) {
    return this.service.getProfile(userId, tenantId);
  }
}
