import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookie, verifySessionToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  const token = getSessionFromCookie(request.headers.get("cookie"));
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
  return NextResponse.json({
    userId: payload.userId,
    tenantId: payload.tenantId,
    email: payload.email,
  });
}
