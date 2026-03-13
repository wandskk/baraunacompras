import { CategoryService } from "../services";
import type { CreateCategoryInput } from "../schemas";

export class CreateCategoryUseCase {
  private service = new CategoryService();

  async execute(input: CreateCategoryInput) {
    return this.service.create(input);
  }
}
