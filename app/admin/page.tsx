import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { AdminShell } from "@/components/admin/AdminShell";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { whatsappConfigured } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function labelStatus(status: string) {
  const map: Record<string, string> = {
    pendente: "Pendente",
    pendente_configuracao: "Integração pendente",
    enviado: "Enviado à API",
    entregue: "Entregue",
    falhou: "Falhou",
    nao_aplicavel: "Não aplicável",
  };
  return map[status] ?? status;
}

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const store = await getStore();
  const [items, settings] = await Promise.all([store.list(), store.getSettings()]);
  const configured = whatsappConfigured();

  return (
    <AdminShell>
      {!configured ? (
        <div className="mb-6 rounded-2xl border border-copper bg-sand p-4">
          <p className="font-semibold text-teal-deep">Integração WhatsApp pendente</p>
          <p className="mt-2 text-base">
            As avaliações estão sendo salvas e o PDF permanece acessível neste painel. O sistema não
            apresenta “PDF enviado” enquanto WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID do número
            remetente da Cloud API não estiverem configurados. O número 5522997231553 é o destino da
            mensagem, não o remetente da API.
          </p>
        </div>
      ) : null}

      <section className="card mb-8 p-5">
        <h2 className="font-serif text-2xl text-teal-deep">Cadastro profissional</h2>
        <p className="mt-2 text-ink-soft">
          Preencha CREF, foto real e dados de privacidade somente com informações verificadas.
        </p>
        <SettingsForm settings={settings} />
      </section>

      <h2 className="font-serif text-2xl text-teal-deep">Avaliações</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse bg-white text-left text-base">
          <thead>
            <tr className="border-b border-line">
              <th className="p-3">Protocolo</th>
              <th className="p-3">Pessoa</th>
              <th className="p-3">Data</th>
              <th className="p-3">WhatsApp</th>
              <th className="p-3">Revisão</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td className="p-3" colSpan={5}>
                  Nenhuma avaliação ainda.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-line">
                  <td className="p-3">
                    <a className="font-semibold text-teal underline" href={`/admin/avaliacoes/${item.id}`}>
                      {item.protocol}
                    </a>
                  </td>
                  <td className="p-3">{item.answers.nomeCompleto}</td>
                  <td className="p-3">{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="p-3">{labelStatus(item.whatsappStatus)}</td>
                  <td className="p-3">{item.flags.length ? `${item.flags.length} ponto(s)` : "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
