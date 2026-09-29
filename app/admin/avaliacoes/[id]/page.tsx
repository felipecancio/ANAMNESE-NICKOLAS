import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { ResendButton } from "@/components/admin/ResendButton";
import { buildQuestionRows } from "@/lib/questions";
import { labelOf } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function AssessmentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const record = await (await getStore()).getById(id);
  if (!record) notFound();
  const rows = buildQuestionRows(record.answers);

  return (
    <AdminShell>
      <p className="text-sm">
        <a className="underline" href="/admin">
          ← Todas as avaliações
        </a>
      </p>
      <h1 className="mt-4 font-serif text-3xl text-teal-deep">{record.protocol}</h1>
      <p className="mt-2 text-ink-soft">
        {record.answers.nomeCompleto} · {record.answers.idade} anos · {record.answers.cidade}/{record.answers.estado}
      </p>
      <p className="mt-2">Status WhatsApp: {record.whatsappStatus}</p>
      {record.whatsappError ? <p className="mt-2 field-error">{record.whatsappError}</p> : null}

      {record.flags.length ? (
        <section className="mt-6 rounded-2xl border border-copper bg-sand p-4">
          <h2 className="font-semibold text-teal-deep">Pontos para revisão prioritária</h2>
          <p className="mt-1 text-sm">Não são diagnóstico nem liberação para treinar.</p>
          <ul className="mt-3 list-disc pl-5">
            {record.flags.map((flag) => (
              <li key={flag.code}>{flag.label}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        <a className="btn btn-ghost" href={`/api/avaliacoes/${record.id}/pdf`}>
          Baixar PDF
        </a>
        <ResendButton
          id={record.id}
          disabled={
            record.status === "interrompida_urgencia" ||
            record.whatsappStatus === "entregue" ||
            record.whatsappStatus === "enviado"
          }
        />
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse bg-white text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="p-3">Pergunta</th>
              <th className="p-3">Resposta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line align-top">
                <td className="p-3">
                  <p className="text-sm text-ink-soft">{row.section}</p>
                  <p>{row.pergunta}</p>
                </td>
                <td className="p-3">{row.resposta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="sr-only">{labelOf(record.status)}</p>
    </AdminShell>
  );
}
