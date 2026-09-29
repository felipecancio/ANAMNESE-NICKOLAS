import Link from "next/link";
import { SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="border-b border-line/80 bg-paper-2/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-2xl text-teal-deep">{SITE.professionalName}</p>
          <p className="text-base text-ink-soft">
            {SITE.role} | {SITE.location}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {settings.cref
              ? `Registro profissional: ${settings.cref}`
              : "Registro profissional (CREF): campo administrativo a ser preenchido pelo responsável"}
          </p>
        </div>
        <a href="#avaliacao" className="btn btn-primary w-full sm:w-auto">
          Iniciar avaliação
        </a>
      </div>
    </header>
  );
}

export function Hero({ settings }: { settings: SiteSettings }) {
  const photo = settings.photoPath || process.env.NEXT_PUBLIC_PHOTO_URL || "";
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-copper">
          Consultoria de movimento · Rio de Janeiro
        </p>
        <h1 className="font-serif text-4xl leading-tight text-teal-deep sm:text-5xl">
          Um plano de exercícios que começa entendendo você.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink-soft">
          Acompanhamento individualizado para quem deseja recuperar confiança no movimento,
          melhorar a capacidade física e trabalhar objetivos reais após lesões, dores ou com
          limitações de mobilidade. O primeiro passo é uma avaliação inicial, analisada pelo
          professor antes de qualquer proposta de treino.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#avaliacao" className="btn btn-primary">
            Preencher minha avaliação inicial
          </a>
          <a href="#como-funciona" className="btn btn-ghost">
            Como funciona
          </a>
        </div>
      </div>
      <div className="relative">
        {photo ? (
          // Foto cadastrada pelo responsável; não usar imagens de terceiros como se fossem do professor.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt="Professor Nickolas Amaral, educador físico"
            width={720}
            height={860}
            className="h-auto w-full rounded-[2rem] object-cover shadow-xl"
          />
        ) : (
          <div className="card relative overflow-hidden p-8">
            <MovementArt />
            <p className="relative mt-8 font-serif text-2xl text-teal-deep">Espaço para foto oficial</p>
            <p className="relative mt-2 text-base text-ink-soft">
              A foto real do professor pode ser cadastrada no painel administrativo. Enquanto isso,
              esta composição visual permanece no lugar, sem usar imagem de terceiros como se fosse
              dele.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function MovementArt() {
  return (
    <svg viewBox="0 0 420 280" className="relative h-auto w-full" aria-hidden="true">
      <rect width="420" height="280" rx="28" fill="#e7efe9" />
      <path
        d="M30 190 C90 40, 150 250, 220 120 S340 40, 390 160"
        fill="none"
        stroke="#1a4d4a"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <circle cx="92" cy="92" r="18" fill="#9a6b3d" opacity="0.85" />
      <circle cx="310" cy="78" r="46" fill="#1a4d4a" opacity="0.12" />
      <path
        d="M70 230 H350"
        stroke="#cbb89a"
        strokeWidth="3"
        strokeDasharray="8 10"
      />
    </svg>
  );
}

export function ForWhom() {
  const items = [
    {
      title: "Retomada após lesão ou tratamento",
      text: "Para quem está voltando a se movimentar depois de um período de cuidado e precisa de uma escuta atenta antes de treinar.",
    },
    {
      title: "Dores ou limitações",
      text: "Para quem sente dor ou restrição e deseja uma avaliação cuidadosa, sem treino genérico e sem promessa de cura.",
    },
    {
      title: "Envelhecimento ativo",
      text: "Para pessoas idosas que buscam mais força, equilíbrio, mobilidade e autonomia, com segurança e respeito ao próprio ritmo.",
    },
    {
      title: "Cansadas de treinos genéricos",
      text: "Para quem não se reconhece em fichas prontas e prefere um acompanhamento alinhado a objetivos reais do dia a dia.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-8" id="para-quem">
      <h2 className="font-serif text-3xl text-teal-deep">Para quem é</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.title} className="card p-6">
            <h3 className="font-serif text-2xl text-teal-deep">{item.title}</h3>
            <p className="mt-3 text-ink-soft">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Você responde à avaliação inicial",
      text: "Um questionário em etapas, com perguntas objetivas e espaço para o que não couber em uma opção.",
    },
    {
      n: "02",
      title: "Nickolas analisa o seu caso",
      text: "Objetivos, histórico, limitações e preferências são lidos com calma. Nenhum plano é prescrito automaticamente após o envio.",
    },
    {
      n: "03",
      title: "O contato segue pelo WhatsApp",
      text: "O professor esclarece informações e explica os próximos passos. O treinamento pode integrar um cuidado multidisciplinar e não substitui avaliação médica ou fisioterapêutica quando ela for necessária.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-12" id="como-funciona">
      <h2 className="font-serif text-3xl text-teal-deep">Como funciona</h2>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <article key={step.n} className="card p-6">
            <p className="text-sm font-semibold tracking-widest text-copper">{step.n}</p>
            <h3 className="mt-2 font-serif text-2xl text-teal-deep">{step.title}</h3>
            <p className="mt-3 text-ink-soft">{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-16 border-t border-line bg-teal-deep text-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">{SITE.professionalName}</p>
          <p className="mt-2 text-sand">
            {SITE.role} | {SITE.location}
          </p>
          <p className="mt-2 text-sm text-sand">
            {settings.cref ? `CREF ${settings.cref}` : "CREF: cadastro pendente no painel"}
          </p>
        </div>
        <div>
          <p className="font-semibold">Contato</p>
          <p className="mt-2 text-sand">WhatsApp {SITE.whatsappDisplay}</p>
          <p className="mt-3 text-sm text-sand">
            Este formulário não é um canal de urgência. Em emergência no Brasil, ligue 192 (SAMU).
          </p>
        </div>
        <div>
          <p className="font-semibold">Informações</p>
          <p className="mt-2">
            <Link className="underline decoration-sand/60 underline-offset-4" href="/privacidade">
              Política de Privacidade
            </Link>
          </p>
          <p className="mt-2">
            <Link className="underline decoration-sand/60 underline-offset-4" href="/admin">
              Área do professor
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
