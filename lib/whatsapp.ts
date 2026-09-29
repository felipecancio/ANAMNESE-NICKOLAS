export function visitorWhatsAppLink(protocol: string): string {
  const text = `Olá, professor Nickolas! Acabei de preencher minha avaliação inicial. Meu protocolo é ${protocol}.`;
  return `https://wa.me/5522997231553?text=${encodeURIComponent(text)}`;
}

export function assertSafeVisitorMessage(url: string, protocol: string) {
  if (!url.startsWith("https://wa.me/5522997231553?text=")) {
    throw new Error("Unexpected WhatsApp URL");
  }
  const decoded = decodeURIComponent(url);
  if (decoded.includes("pdf") || decoded.includes("diagnóstico") || decoded.includes("dorRepouso")) {
    throw new Error("Visitor WhatsApp URL must not include health payload");
  }
  if (!decoded.includes(protocol)) {
    throw new Error("Visitor WhatsApp URL must include protocol");
  }
}

export function whatsappConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

type SendResult =
  | { ok: true; messageId: string }
  | { ok: false; retryable: boolean; error: string };

async function uploadDocument(pdf: Uint8Array, filename: string): Promise<SendResult & { mediaId?: string }> {
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "document");
  form.append(
    "file",
    new Blob([Buffer.from(pdf)], { type: "application/pdf" }),
    filename,
  );

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  const json = (await response.json().catch(() => ({}))) as {
    id?: string;
    error?: { message?: string; code?: number };
  };

  if (!response.ok || !json.id) {
    const message = json.error?.message || `Falha no upload de mídia (${response.status})`;
    return { ok: false, retryable: response.status >= 500 || response.status === 429, error: message };
  }
  return { ok: true, messageId: json.id, mediaId: json.id };
}

export async function sendPdfToProfessor(opts: {
  pdf: Uint8Array;
  protocol: string;
  filename: string;
}): Promise<SendResult> {
  if (!whatsappConfigured()) {
    return {
      ok: false,
      retryable: false,
      error: "Integração WhatsApp pendente: credenciais da Cloud API não configuradas.",
    };
  }

  const destination = process.env.WHATSAPP_DESTINATION || "5522997231553";
  const token = process.env.WHATSAPP_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
  const version = process.env.WHATSAPP_API_VERSION || "v21.0";

  try {
    const uploaded = await uploadDocument(opts.pdf, opts.filename);
    if (!uploaded.ok || !uploaded.mediaId) return uploaded;

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: destination,
        type: "document",
        document: {
          id: uploaded.mediaId,
          filename: opts.filename,
          caption: `Avaliação inicial — protocolo ${opts.protocol}`,
        },
      }),
    });

    const json = (await response.json().catch(() => ({}))) as {
      messages?: { id: string }[];
      error?: { message?: string };
    };

    if (!response.ok || !json.messages?.[0]?.id) {
      const message = json.error?.message || `Falha no envio (${response.status})`;
      return { ok: false, retryable: response.status >= 500 || response.status === 429, error: message };
    }

    return { ok: true, messageId: json.messages[0].id };
  } catch {
    return { ok: false, retryable: true, error: "Falha de rede ao falar com a WhatsApp Cloud API." };
  }
}

export function isRetryableWhatsappError(error: string | null): boolean {
  if (!error) return true;
  if (error.toLowerCase().includes("pendente")) return false;
  if (error.toLowerCase().includes("credenciais")) return false;
  return true;
}

export type WhatsappWebhookPayload = {
  entry?: {
    changes?: {
      value?: {
        statuses?: {
          id: string;
          status: string;
          errors?: { title?: string; message?: string }[];
        }[];
      };
    }[];
  }[];
};

export function extractStatusUpdates(payload: WhatsappWebhookPayload): {
  messageId: string;
  status: "enviado" | "entregue" | "falhou";
  error?: string;
}[] {
  const out: { messageId: string; status: "enviado" | "entregue" | "falhou"; error?: string }[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const item of change.value?.statuses ?? []) {
        if (item.status === "sent") out.push({ messageId: item.id, status: "enviado" });
        if (item.status === "delivered" || item.status === "read") {
          out.push({ messageId: item.id, status: "entregue" });
        }
        if (item.status === "failed") {
          out.push({
            messageId: item.id,
            status: "falhou",
            error: item.errors?.[0]?.title || item.errors?.[0]?.message || "Falha informada pelo WhatsApp",
          });
        }
      }
    }
  }
  return out;
}
