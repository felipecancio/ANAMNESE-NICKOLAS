import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore, readPdfFile } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id } = await context.params;
  const store = await getStore();
  const record = await store.getById(id);
  if (!record?.pdfFilename) {
    return NextResponse.json({ error: "PDF não encontrado." }, { status: 404 });
  }
  const bytes = await readPdfFile(record.pdfFilename);
  if (!bytes) {
    return NextResponse.json({ error: "Arquivo indisponível." }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${record.protocol}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
