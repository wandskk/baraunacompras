import { NextResponse } from "next/server";
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
    const customerService = new CustomerService();
    const customer = await customerService.findOrCreate({
      email: input.email,
      name: input.name,
      tenantId,
      storeId,
    });
    const order = await orderController.create({
      tenantId,
      storeId,
      customerId: customer.id,
      total: input.total!,
      status: "pending",
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
