import Link from "next/link";
import { visitorWhatsAppLink } from "@/lib/whatsapp";

export default async function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;
  const protocol = (p || "").replace(/[^A-Z0-9-]/gi, "").slice(0, 40);
  const whatsapp = protocol ? visitorWhatsAppLink(protocol) : "";

  return (
    <main id="conteudo" className="mx-auto max-w-2xl px-5 py-16">
      <h1 className="font-serif text-4xl text-teal-deep">Avaliação recebida</h1>
      <p className="mt-4 text-lg">
        Obrigado. O professor Nickolas vai analisar as respostas antes de qualquer proposta de treino.
      </p>
      {protocol ? (
        <p className="mt-6 rounded-2xl bg-sand p-4">
          Seu protocolo: <strong>{protocol}</strong>
        </p>
      ) : null}
      <p className="mt-6 text-ink-soft">
        As respostas de saúde não entram no texto do WhatsApp. Use o botão abaixo apenas para abrir a
        conversa com o número do protocolo.
      </p>
      {whatsapp ? (
        <p className="mt-8">
          <a className="btn btn-primary" href={whatsapp}>
            Falar com o professor no WhatsApp
          </a>
        </p>
      ) : null}
      <p className="mt-8">
        <Link className="underline" href="/">
          Voltar à página inicial
        </Link>
      </p>
    </main>
  );
}
