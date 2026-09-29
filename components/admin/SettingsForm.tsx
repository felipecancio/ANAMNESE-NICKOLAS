"use client";

import { useState } from "react";
import type { SiteSettings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/configuracoes", { method: "POST", body: form });
    const json = (await response.json()) as { ok?: boolean; error?: string };
    if (!response.ok) {
      setError(json.error || "Não foi possível salvar.");
      return;
    }
    setMessage("Cadastro atualizado.");
  }

  return (
    <form className="mt-4 grid gap-4" onSubmit={(e) => void onSubmit(e)}>
      <label className="font-semibold" htmlFor="cref">
        Número de registro profissional (CREF)
      </label>
      <input id="cref" name="cref" className="field-control" defaultValue={settings.cref} />
      <label className="font-semibold" htmlFor="responsibleName">
        Responsável pelo tratamento dos dados
      </label>
      <input id="responsibleName" name="responsibleName" className="field-control" defaultValue={settings.responsibleName} />
      <label className="font-semibold" htmlFor="responsibleEmail">
        E-mail para solicitações de privacidade
      </label>
      <input id="responsibleEmail" name="responsibleEmail" type="email" className="field-control" defaultValue={settings.responsibleEmail} />
      <label className="font-semibold" htmlFor="retentionNote">
        Prazo de retenção (texto exibido na política)
      </label>
      <input id="retentionNote" name="retentionNote" className="field-control" defaultValue={settings.retentionNote} placeholder="Ex.: 24 meses" />
      <label className="font-semibold" htmlFor="photo">
        Foto oficial do professor
      </label>
      <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" />
      <button className="btn btn-primary w-fit" type="submit">
        Salvar cadastro
      </button>
      {message ? <p className="text-ok">{message}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}
