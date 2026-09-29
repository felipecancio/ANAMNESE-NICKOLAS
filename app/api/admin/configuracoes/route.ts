import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import type { SiteSettings } from "@/lib/types";
import { uploadsDir } from "@/lib/store";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const store = await getStore();
  const current = await store.getSettings();
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const next: SiteSettings = {
      cref: String(form.get("cref") ?? current.cref).slice(0, 80),
      photoPath: current.photoPath,
      responsibleName: String(form.get("responsibleName") ?? current.responsibleName).slice(0, 120),
      responsibleEmail: String(form.get("responsibleEmail") ?? current.responsibleEmail).slice(0, 120),
      retentionNote: String(form.get("retentionNote") ?? current.retentionNote).slice(0, 200),
    };
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      if (photo.size > 3_000_000) {
        return NextResponse.json({ error: "A foto deve ter no máximo 3 MB." }, { status: 400 });
      }
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(photo.type)) {
        return NextResponse.json({ error: "Envie uma foto JPG, PNG ou WEBP." }, { status: 400 });
      }
      const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
      const filename = `profissional.${ext}`;
      const dest = path.join(uploadsDir(), filename);
      await fs.promises.writeFile(dest, Buffer.from(await photo.arrayBuffer()));
      next.photoPath = `/api/media/foto?v=${Date.now()}`;
    }
    await store.saveSettings(next);
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as Partial<SiteSettings>;
  await store.saveSettings({
    ...current,
    ...body,
  });
  return NextResponse.json({ ok: true });
}
