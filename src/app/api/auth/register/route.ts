import { NextResponse } from "next/server";
import { AuthController } from "@/modules/auth/controllers";
import { setSessionCookie } from "@/lib/session-cookie";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new AuthController();
    const user = await controller.register(body);
    const session = { userId: user.id, tenantId: body.tenantId, email: user.email };
    const cookieHeader = await setSessionCookie(session);
    const res = NextResponse.json(user, { status: 201 });
    res.headers.set("Set-Cookie", cookieHeader);
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
