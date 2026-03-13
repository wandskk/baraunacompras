import { CustomerService } from "../services";
import { createCustomerSchema, updateCustomerSchema } from "../schemas";

export class CustomerController {
  private service = new CustomerService();

  async create(body: unknown) {
    const input = createCustomerSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.service.listByStore(storeId, tenantId);
  }

  async update(id: string, tenantId: string, body: unknown) {
    const input = updateCustomerSchema.parse(body);
    return this.service.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
