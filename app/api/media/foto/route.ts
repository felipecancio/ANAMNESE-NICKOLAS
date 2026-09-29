import { NextResponse } from "next/server";
import { getStore } from "@/lib/store";
import { uploadsDir } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function GET() {
  const settings = await (await getStore()).getSettings();
  if (!settings.photoPath) {
    return NextResponse.json({ error: "Sem foto cadastrada." }, { status: 404 });
  }
  const dir = uploadsDir();
  const files = ["profissional.jpg", "profissional.jpeg", "profissional.png", "profissional.webp"];
  const found = files.map((name) => path.join(dir, name)).find((full) => fs.existsSync(full));
  if (!found) return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  const bytes = await fs.promises.readFile(found);
  const ext = path.extname(found);
  const type = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
