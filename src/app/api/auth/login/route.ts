import { NextResponse } from "next/server";
import { AuthController } from "@/modules/auth/controllers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new AuthController();
    const session = await controller.login(body);
    return NextResponse.json(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid credentials";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
