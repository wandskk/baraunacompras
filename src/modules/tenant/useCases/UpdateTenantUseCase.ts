import { TenantService } from "../services";
import type { UpdateTenantInput } from "../schemas";

export class UpdateTenantUseCase {
  private service = new TenantService();

  async execute(id: string, input: UpdateTenantInput) {
    return this.service.update(id, input);
  }
}
