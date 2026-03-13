import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { apiErrorResponse } from "@/lib/api-errors";
import { tenantIdParamSchema } from "@/lib/params-schemas";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Params = { params: Promise<{ tenantId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { tenantId } = await params;
    tenantIdParamSchema.parse({ tenantId });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use: JPEG, PNG, WebP ou GIF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 2MB" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "png";
    const filename = `uploads/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    if (error instanceof Error && error.message.includes("BLOB_READ_WRITE_TOKEN")) {
      return NextResponse.json(
        { error: "Upload não configurado. Defina BLOB_READ_WRITE_TOKEN no .env" },
        { status: 503 }
      );
    }
    return apiErrorResponse(error);
  }
}
