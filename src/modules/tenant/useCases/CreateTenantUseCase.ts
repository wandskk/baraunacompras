import { TenantService } from "../services";
import type { CreateTenantInput } from "../schemas";

export class CreateTenantUseCase {
  private service = new TenantService();

  async execute(input: CreateTenantInput) {
    return this.service.create(input);
  }
}
