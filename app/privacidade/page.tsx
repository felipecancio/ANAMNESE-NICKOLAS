import Link from "next/link";
import { getStore } from "@/lib/store";
import { privacyCopy } from "@/lib/privacy";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const settings = await (await getStore()).getSettings();
  const copy = privacyCopy(settings);

  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-sm font-semibold text-copper">
        <Link href="/">← Voltar</Link>
      </p>
      <h1 className="mt-4 font-serif text-4xl text-teal-deep">Política de Privacidade</h1>
      <p className="mt-6 text-ink-soft">
        Esta política descreve como as respostas da avaliação inicial são tratadas. Dados de saúde são
        dados sensíveis e recebem uso restrito.
      </p>
      <section className="mt-8 space-y-4">
        <h2 className="font-serif text-2xl text-teal-deep">Responsável pelo tratamento</h2>
        <p>
          {copy.controller}, educador físico em {SITE.location}. Contato para solicitações: {copy.email}.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Finalidade</h2>
        <p>
          As informações são coletadas para avaliação inicial do caso, contato com a pessoa interessada
          e organização do atendimento individualizado. Não são usadas para diagnóstico automático nem
          para treino prescrito pela página.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Dados coletados</h2>
        <p>
          Nome, idade, cidade, estado, WhatsApp, e-mail opcional, quem preenche o formulário, objetivos,
          histórico de saúde relatado pela própria pessoa, limitações, rotina e autorizações. Não
          pedimos CPF, endereço completo nem upload de exames nesta versão.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Envio pelo WhatsApp</h2>
        <p>
          O relatório em PDF pode ser enviado ao professor pelo WhatsApp Business, quando a integração
          oficial estiver configurada. O aplicativo de mensagens é operado por terceiros. Ao autorizar,
          você concorda com esse encaminhamento para a finalidade da avaliação inicial.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Quem tem acesso</h2>
        <p>
          O professor responsável e, se houver, um administrador técnico estritamente para manutenção
          do sistema. Respostas de saúde não são enviadas a pixels de marketing, Google Analytics nem
          ferramentas publicitárias.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Prazo de retenção</h2>
        <p>{copy.retention}.</p>
        <h2 className="font-serif text-2xl text-teal-deep">Direitos e exclusão</h2>
        <p>
          Para acessar, corrigir ou pedir a exclusão dos dados, escreva para {copy.email} informando o
          protocolo da avaliação, quando houver. O responsável confirmará a identidade de forma
          proporcional e excluirá os registros e o PDF associados, salvo obrigação legal de guarda.
        </p>
        <h2 className="font-serif text-2xl text-teal-deep">Urgência</h2>
        <p>
          Este canal não é atendimento de emergência. Em emergência no Brasil, ligue 192 (SAMU).
        </p>
      </section>
    </main>
  );
}
