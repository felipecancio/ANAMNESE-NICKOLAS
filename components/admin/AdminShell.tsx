"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  }
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div>
            <p className="font-serif text-xl text-teal-deep">Painel do professor</p>
            <p className="text-sm text-ink-soft">Acesso restrito · dados de saúde</p>
          </div>
          <div className="flex gap-3">
            <Link className="btn btn-ghost" href="/admin">
              Avaliações
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => void logout()}>
              Sair
            </button>
          </div>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-5 py-8">
        {children}
      </main>
    </div>
  );
}
