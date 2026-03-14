import { NextResponse } from "next/server";
import { prisma } from "@/database/prisma";
import { CustomerService } from "@/modules/customer/services";
import { OrderController } from "@/modules/order/controllers";
import { checkoutSchema, checkoutFromCartSchema } from "@/modules/order/schemas";
import { apiErrorResponse } from "@/lib/api-errors";
import { storeParamsSchema } from "@/lib/params-schemas";

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const rawParams = await params;
    storeParamsSchema.parse(rawParams);
    const { tenantId, storeId } = rawParams;
    const body = await request.json();
    const orderController = new OrderController();
    if (body.cartId) {
      const order = await orderController.checkoutFromCart(tenantId, storeId, body);
      return NextResponse.json(order, { status: 201 });
    }
    const input = checkoutSchema.parse(body);
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }
    const storeDeliveryType = (store.deliveryType as string) ?? "pickup";
    const deliveryType = input.deliveryType ?? "pickup";
    if (storeDeliveryType === "pickup" && deliveryType === "delivery") {
      return NextResponse.json({ error: "Esta loja não oferece entrega" }, { status: 400 });
    }
    if (storeDeliveryType === "delivery" && deliveryType === "pickup") {
      return NextResponse.json({ error: "Esta loja não oferece retirada" }, { status: 400 });
    }
    let total = input.total!;
    let deliveryFee = 0;
    const deliveryData: Record<string, unknown> = {};
    if (deliveryType === "delivery" && input.deliveryAddress) {
      deliveryFee = store.deliveryFee != null ? Number(store.deliveryFee) : 0;
      total += deliveryFee;
      deliveryData.deliveryType = "delivery";
      deliveryData.deliveryFee = deliveryFee;
      deliveryData.deliveryStreet = input.deliveryAddress.street;
      deliveryData.deliveryNumber = input.deliveryAddress.number;
      deliveryData.deliveryComplement = input.deliveryAddress.complement;
      deliveryData.deliveryNeighborhood = input.deliveryAddress.neighborhood;
      deliveryData.deliveryCity = input.deliveryAddress.city;
      deliveryData.deliveryState = input.deliveryAddress.state;
      deliveryData.deliveryZipCode = input.deliveryAddress.zipCode.replace(/\D/g, "");
    } else if (deliveryType === "pickup") {
      deliveryData.deliveryType = "pickup";
    }
    const customerService = new CustomerService();
    const customer = await customerService.findOrCreate({
      email: input.email,
      name: input.name,
      phone: input.phone || undefined,
      tenantId,
      storeId,
    });
    const order = await orderController.create({
      tenantId,
      storeId,
      customerId: customer.id,
      total,
      status: "pending",
      paymentMethod: input.paymentMethod ?? "pix",
      ...deliveryData,
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
