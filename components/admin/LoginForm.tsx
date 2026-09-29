"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error || "Não foi possível entrar.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="card mt-8 space-y-4 p-6" onSubmit={(e) => void onSubmit(e)}>
      <label className="font-semibold" htmlFor="password">
        Senha
      </label>
      <input
        id="password"
        className="field-control"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error ? <p className="field-error">{error}</p> : null}
      <button className="btn btn-primary" type="submit">
        Entrar
      </button>
    </form>
  );
}
