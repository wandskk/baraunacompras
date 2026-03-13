import { OrderService } from "../services";
import { createOrderSchema, updateOrderSchema } from "../schemas";

export class OrderController {
  private service = new OrderService();

  async create(body: unknown) {
    const input = createOrderSchema.parse(body);
    return this.service.create(input);
  }

  async getById(id: string, tenantId: string) {
    return this.service.getById(id, tenantId);
  }

  async listByStore(storeId: string, tenantId: string) {
    return this.service.listByStore(storeId, tenantId);
  }

  async listByTenant(tenantId: string) {
    return this.service.listByTenant(tenantId);
  }

  async update(id: string, tenantId: string, body: unknown) {
    const input = updateOrderSchema.parse(body);
    return this.service.update(id, tenantId, input);
  }

  async delete(id: string, tenantId: string) {
    return this.service.delete(id, tenantId);
  }
}
