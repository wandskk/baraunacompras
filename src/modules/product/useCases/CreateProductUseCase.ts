import { ProductService } from "../services";
import type { CreateProductInput } from "../schemas";

export class CreateProductUseCase {
  private service = new ProductService();

  async execute(input: CreateProductInput) {
    return this.service.create(input);
  }
}
