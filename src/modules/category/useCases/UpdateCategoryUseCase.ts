import { CategoryService } from "../services";
import type { UpdateCategoryInput } from "../schemas";

export class UpdateCategoryUseCase {
  private service = new CategoryService();

  async execute(id: string, tenantId: string, input: UpdateCategoryInput) {
    return this.service.update(id, tenantId, input);
  }
}
