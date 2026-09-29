import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main id="conteudo" className="mx-auto max-w-md px-5 py-16">
      <h1 className="font-serif text-3xl text-teal-deep">Área do professor</h1>
      <p className="mt-3 text-ink-soft">Acesso protegido. Não compartilhe esta senha.</p>
      <LoginForm />
    </main>
  );
}
