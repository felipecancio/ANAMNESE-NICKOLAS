import { NextResponse } from "next/server";
import { assertSameOrigin, loginAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { hashIp } from "@/lib/crypto";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ error: "Origem inválida." }, { status: 403 });
  }
  const store = await getStore();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";
  if (await store.hitRateLimit(`login:${hashIp(ip)}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Muitas tentativas de acesso." }, { status: 429 });
  }
  const body = (await request.json()) as { password?: string };
  if (!body.password || !(await loginAdmin(body.password))) {
    return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
