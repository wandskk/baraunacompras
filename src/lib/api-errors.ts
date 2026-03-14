import { ZodError } from "zod";
import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "BAD_REQUEST"
  | "INTERNAL_ERROR";

export type ApiErrorResponse = {
  code: ApiErrorCode;
  error: string;
  details?: Array<{ path: string; message: string }>;
};

/** Erro de validação com campo específico para exibir no formulário */
export class FieldValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = "FieldValidationError";
  }
}

export function toErrorResponse(error: unknown): { status: number; json: ApiErrorResponse } {
  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const firstMessage = issues[0]?.message ?? "Dados inválidos";
    return {
      status: 400,
      json: {
        code: "VALIDATION_ERROR",
        error: firstMessage,
        details: issues,
      },
    };
  }
  if (error instanceof FieldValidationError) {
    return {
      status: 400,
      json: {
        code: "VALIDATION_ERROR",
        error: error.message,
        details: [{ path: error.field, message: error.message }],
      },
    };
  }
  const message = error instanceof Error ? error.message : "Erro interno";
  const lower = message.toLowerCase();
  if (lower.includes("not found") || lower.includes("não encontrado")) {
    return { status: 404, json: { code: "NOT_FOUND", error: message } };
  }
  if (lower.includes("unauthorized") || lower.includes("invalid credentials")) {
    return { status: 401, json: { code: "UNAUTHORIZED", error: message } };
  }
  return {
    status: 400,
    json: { code: "BAD_REQUEST", error: message },
  };
}

export function apiErrorResponse(error: unknown): NextResponse {
  const { status, json } = toErrorResponse(error);
  return NextResponse.json(json, { status });
}
