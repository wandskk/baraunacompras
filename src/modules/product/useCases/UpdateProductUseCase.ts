import { ProductService } from "../services";
import type { UpdateProductInput } from "../schemas";

export class UpdateProductUseCase {
  private service = new ProductService();

  async execute(id: string, tenantId: string, input: UpdateProductInput) {
    return this.service.update(id, tenantId, input);
  }
}
