import { OrderService } from "../services";
import type { CreateOrderInput } from "../schemas";

export class CreateOrderUseCase {
  private service = new OrderService();

  async execute(input: CreateOrderInput) {
    return this.service.create(input);
  }
}
