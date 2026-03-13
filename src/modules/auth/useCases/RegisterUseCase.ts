import { AuthService } from "../services";
import type { RegisterInput } from "../schemas";

export class RegisterUseCase {
  private service = new AuthService();

  async execute(input: RegisterInput) {
    return this.service.register(input);
  }
}
