import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { getStore } from "@/lib/store";
import { extractStatusUpdates, type WhatsappWebhookPayload } from "@/lib/whatsapp";

export const runtime = "nodejs";

function validSignature(request: Request, raw: string): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return false;
  const header = request.headers.get("x-hub-signature-256") || "";
  const expected = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!validSignature(request, raw)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }
  let payload: WhatsappWebhookPayload = {};
  try {
    payload = JSON.parse(raw) as WhatsappWebhookPayload;
  } catch {
    return NextResponse.json({ ok: true });
  }
  const store = await getStore();
  for (const update of extractStatusUpdates(payload)) {
    const record = await store.getByMessageId(update.messageId);
    if (!record) continue;
    await store.update(record.id, {
      whatsappStatus: update.status,
      whatsappError: update.error ?? record.whatsappError,
    });
  }
  return NextResponse.json({ ok: true });
}
