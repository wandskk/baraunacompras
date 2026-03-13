import { NextResponse } from "next/server";
import { CustomerService } from "@/modules/customer/services";
import { OrderController } from "@/modules/order/controllers";
import { z } from "zod";

const checkoutSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  productId: z.string().min(1),
  total: z.coerce.number().positive(),
});

type Params = { params: Promise<{ tenantId: string; storeId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { tenantId, storeId } = await params;
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const customerService = new CustomerService();
    const customer = await customerService.findOrCreate({
      email: input.email,
      name: input.name,
      tenantId,
      storeId,
    });
    const orderController = new OrderController();
    const order = await orderController.create({
      tenantId,
      storeId,
      customerId: customer.id,
      total: input.total,
      status: "pending",
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
