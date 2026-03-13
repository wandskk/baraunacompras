import { CustomerService } from "../services";
import type { CreateCustomerInput } from "../schemas";

export class CreateCustomerUseCase {
  private service = new CustomerService();

  async execute(input: CreateCustomerInput) {
    return this.service.create(input);
  }
}
