import { ZodError } from "zod";
import { NextResponse } from "next/server";

export function toErrorResponse(error: unknown): { status: number; json: object } {
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return {
      status: 400,
      json: { error: "Validation failed", details: issues },
    };
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  const status = message.toLowerCase().includes("not found") ? 404 : 400;
  return { status, json: { error: message } };
}

export function apiErrorResponse(error: unknown): NextResponse {
  const { status, json } = toErrorResponse(error);
  return NextResponse.json(json, { status });
}
