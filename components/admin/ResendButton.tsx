"use client";

import { useState } from "react";

export function ResendButton({ id, disabled }: { id: string; disabled?: boolean }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    setMessage("");
    setError("");
    const response = await fetch(`/api/admin/avaliacoes/${id}/reenviar`, { method: "POST" });
    const json = (await response.json()) as { ok?: boolean; error?: string; status?: string };
    setLoading(false);
    if (!response.ok || !json.ok) {
      setError(json.error || "Não foi possível reenviar.");
      return;
    }
    setMessage("PDF reenviado à API. O status real depende do retorno do WhatsApp.");
  }

  return (
    <div className="space-y-2">
      <button type="button" className="btn btn-primary" disabled={disabled || loading} onClick={() => void resend()}>
        {loading ? "Reenviando…" : "Reenviar PDF pelo WhatsApp"}
      </button>
      {message ? <p className="text-ok">{message}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
