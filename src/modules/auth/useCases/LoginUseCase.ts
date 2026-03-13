import { AuthService } from "../services";
import type { LoginInput } from "../schemas";

export class LoginUseCase {
  private service = new AuthService();

  async execute(input: LoginInput) {
    return this.service.login(input);
  }
}
