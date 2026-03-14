import { prisma } from "@/database/prisma";
import { OrderRepository } from "../repositories";
import { CartService } from "@/modules/cart/services";
import { CustomerService } from "@/modules/customer/services";
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
} from "@/lib/email";
import type { CreateOrderInput, UpdateOrderInput } from "../schemas";

export class OrderService {
  private repository = new OrderRepository();
  private cartService = new CartService();
  private customerService = new CustomerService();

  async create(input: CreateOrderInput) {
    return this.repository.create({
      ...input,
      status: input.status ?? "pending",
    });
  }

  async checkoutFromCart(input: {
    tenantId: string;
    storeId: string;
    cartId: string;
    email: string;
    name?: string;
    deliveryType?: "pickup" | "delivery";
    deliveryAddress?: {
      zipCode: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
  }) {
    const cart = await this.cartService.getById(input.cartId, input.tenantId);
    if (cart.storeId !== input.storeId) {
      throw new Error("Cart does not belong to this store");
    }
    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }
    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
    });
    if (!store) throw new Error("Store not found");
    const storeDeliveryType = (store.deliveryType as "pickup" | "delivery" | "both") ?? "pickup";
    const deliveryType = input.deliveryType ?? "pickup";
    if (storeDeliveryType === "pickup" && deliveryType === "delivery") {
      throw new Error("Esta loja não oferece entrega");
    }
    if (storeDeliveryType === "delivery" && deliveryType === "pickup") {
      throw new Error("Esta loja não oferece retirada");
    }
    let deliveryFee = 0;
    if (deliveryType === "delivery" && store.deliveryFee != null) {
      deliveryFee = Number(store.deliveryFee);
      if (!input.deliveryAddress) {
        throw new Error("Endereço de entrega é obrigatório");
      }
    }
    const customer = await this.customerService.findOrCreate({
      email: input.email,
      name: input.name,
      tenantId: input.tenantId,
      storeId: input.storeId,
    });
    let total = 0;
    const items = cart.items.map((item) => {
      const price = Number(item.product.price);
      const qty = item.quantity;
      total += price * qty;
      return {
        productId: item.productId,
        quantity: qty,
        price,
        variation: (item as { variation?: string }).variation ?? "",
        size: (item as { size?: string }).size ?? "",
      };
    });
    total += deliveryFee;
    const order = await this.repository.createWithItems(
      {
        tenantId: input.tenantId,
        storeId: input.storeId,
        customerId: customer.id,
        total,
        status: "pending",
        deliveryType,
        deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
        deliveryStreet: input.deliveryAddress?.street,
        deliveryNumber: input.deliveryAddress?.number,
        deliveryComplement: input.deliveryAddress?.complement,
        deliveryNeighborhood: input.deliveryAddress?.neighborhood,
        deliveryCity: input.deliveryAddress?.city,
        deliveryState: input.deliveryAddress?.state,
        deliveryZipCode: input.deliveryAddress?.zipCode.replace(/\D/g, ""),
      },
      items
    );
    await this.cartService.delete(input.cartId, input.tenantId);
    sendOrderConfirmation(order).catch(() => {});
    return order;
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
    const existing = await this.getById(id, tenantId);
    const order = await this.repository.update(id, tenantId, input);
    if (order && input.status && input.status !== existing.status) {
      const statusesToNotify = ["confirmed", "shipped", "delivered"];
      if (statusesToNotify.includes(input.status)) {
        sendOrderStatusUpdate(order, input.status).catch(() => {});
      }
    }
    return order;
  }

  async delete(id: string, tenantId: string) {
    await this.getById(id, tenantId);
    return this.repository.delete(id, tenantId);
  }
}
