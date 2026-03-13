import { CustomerService } from "../services";
import type { UpdateCustomerInput } from "../schemas";

export class UpdateCustomerUseCase {
  private service = new CustomerService();

  async execute(id: string, tenantId: string, input: UpdateCustomerInput) {
    return this.service.update(id, tenantId, input);
  }
}
