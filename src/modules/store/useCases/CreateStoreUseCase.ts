import { StoreService } from "../services";
import type { CreateStoreInput } from "../schemas";

export class CreateStoreUseCase {
  private service = new StoreService();

  async execute(input: CreateStoreInput) {
    return this.service.create(input);
  }
}
