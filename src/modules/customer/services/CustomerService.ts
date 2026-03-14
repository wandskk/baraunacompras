import { CustomerRepository } from "../repositories";
import type { CreateCustomerInput, UpdateCustomerInput } from "../schemas";

export class CustomerService {
  private repository = new CustomerRepository();

  async create(input: CreateCustomerInput) {
    const existing = await this.repository.findByEmail(
      input.email,
      input.storeId,
      input.tenantId
    );
    if (existing) {
      throw new Error("Customer with this email already exists in this store");
    }
    return this.repository.create(input);
  }

  async findOrCreate(input: CreateCustomerInput) {
    const existing = await this.repository.findByEmail(
      input.email,
      input.storeId,
      input.tenantId
    );
    if (existing) {
      if (input.phone && !existing.phone) {
        await this.repository.update(existing.id, input.tenantId, { phone: input.phone });
        return this.repository.findById(existing.id, input.tenantId) ?? existing;
      }
      return existing;
    }
    return this.repository.create(input);
  }

  async getById(id: string, tenantId: string) {
    const customer = await this.repository.findById(id, tenantId);
    if (!customer) {
      throw new Error("Customer not found");
    }
    return customer;
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.repository.findManyByStore(storeId, tenantId);
  }

  async update(id: string, tenantId: string, input: UpdateCustomerInput) {
    const customer = await this.getById(id, tenantId);
    if (input.email) {
      const existing = await this.repository.findByEmail(
        input.email,
        customer.storeId,
        tenantId
      );
      if (existing && existing.id !== id) {
        throw new Error("Customer with this email already exists in this store");
      }
    }
    return this.repository.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
