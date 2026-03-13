import { CartService } from "../services";
import type { CreateCartInput } from "../schemas";

export class CreateCartUseCase {
  private service = new CartService();

  async execute(input: CreateCartInput) {
    return this.service.create(input);
  }
}
