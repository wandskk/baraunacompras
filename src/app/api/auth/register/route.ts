import { NextResponse } from "next/server";
import { AuthController } from "@/modules/auth/controllers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new AuthController();
    const user = await controller.register(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
