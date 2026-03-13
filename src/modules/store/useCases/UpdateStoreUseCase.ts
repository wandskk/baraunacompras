import { StoreService } from "../services";
import type { UpdateStoreInput } from "../schemas";

export class UpdateStoreUseCase {
  private service = new StoreService();

  async execute(id: string, tenantId: string, input: UpdateStoreInput) {
    return this.service.update(id, tenantId, input);
  }
}
