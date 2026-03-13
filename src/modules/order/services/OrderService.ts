import { OrderRepository } from "../repositories";
import type { CreateOrderInput, UpdateOrderInput } from "../schemas";

export class OrderService {
  private repository = new OrderRepository();

  async create(input: CreateOrderInput) {
    return this.repository.create({
      ...input,
      status: input.status ?? "pending",
    });
  }

  async getById(id: string, tenantId: string) {
    const order = await this.repository.findById(id, tenantId);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.repository.findManyByStore(storeId, tenantId);
  }

  async listByTenant(tenantId: string) {
    return this.repository.findManyByTenant(tenantId);
  }

  async update(id: string, tenantId: string, input: UpdateOrderInput) {
    await this.getById(id, tenantId);
    return this.repository.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
