import { OrderService } from "../services";
import type { UpdateOrderInput } from "../schemas";

export class UpdateOrderStatusUseCase {
  private service = new OrderService();

  async execute(id: string, tenantId: string, input: UpdateOrderInput) {
    return this.service.update(id, tenantId, input);
  }
}
