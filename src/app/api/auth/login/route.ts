import { NextResponse } from "next/server";
import { AuthController } from "@/modules/auth/controllers";
import { setSessionCookie } from "@/lib/session-cookie";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const controller = new AuthController();
    const session = await controller.login(body);
    const cookieHeader = await setSessionCookie(session);
    const res = NextResponse.json(session);
    res.headers.set("Set-Cookie", cookieHeader);
    return res;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid credentials";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
