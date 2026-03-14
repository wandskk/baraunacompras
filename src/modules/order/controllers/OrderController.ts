import { OrderService } from "../services";
import { createOrderSchema, updateOrderSchema, checkoutSchema, checkoutFromCartSchema } from "../schemas";

export class OrderController {
  private service = new OrderService();

  async create(body: unknown) {
    const input = createOrderSchema.parse(body);
    return this.service.create(input);
  }

  async checkoutFromCart(
    tenantId: string,
    storeId: string,
    body: unknown
  ) {
    const input = checkoutFromCartSchema.parse(body);
    return this.service.checkoutFromCart({
      tenantId,
      storeId,
      cartId: input.cartId,
      email: input.email,
      name: input.name,
      phone: input.phone,
      paymentMethod: input.paymentMethod,
      deliveryType: input.deliveryType,
      deliveryAddress: input.deliveryAddress,
    });
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
