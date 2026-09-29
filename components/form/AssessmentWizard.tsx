"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { validateStep } from "@/lib/schema";
import { isUrgentSymptom } from "@/lib/triage";
import { emptyAnswers, type AssessmentAnswers } from "@/lib/types";
import { SITE } from "@/lib/site";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./Steps";

const TITLES = [
  "Identificação e contato",
  "Objetivos e contexto",
  "Histórico de saúde e prontidão",
  "Lesão, dor e limitações",
  "Capacidade funcional e quedas",
  "Rotina e preferências",
  "Revisão e autorização",
];

export function AssessmentWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<AssessmentAnswers>(() => emptyAnswers());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const requestId = useRef("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    setData((current) => (current.startedAt ? current : { ...current, startedAt: Date.now() }));
    if (!requestId.current) requestId.current = crypto.randomUUID();
  }, []);

  const set = (patch: Partial<AssessmentAnswers>) => {
    setData((current) => ({ ...current, ...patch }));
  };

  const progress = (step / 7) * 100;

  function go(next: number) {
    setStep(next);
    setErrors({});
    setFormError("");
    queueMicrotask(() => headingRef.current?.focus());
  }

  function next() {
    const currentErrors = validateStep(step, data);
    if (Object.keys(currentErrors).length) {
      setErrors(currentErrors);
      setFormError("Há campos para revisar nesta etapa.");
      return;
    }
    if (step === 3 && isUrgentSymptom(data)) {
      window.location.assign("/orientacao-urgente");
      return;
    }
    go(Math.min(7, step + 1));
  }

  async function submit() {
    const currentErrors = validateStep(7, data);
    if (Object.keys(currentErrors).length) {
      setErrors(currentErrors);
      setFormError("Confirme as autorizações obrigatórias para enviar.");
      return;
    }
    if (!requestId.current) requestId.current = crypto.randomUUID();
    setSending(true);
    setFormError("");
    try {
      const response = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: data,
          clientRequestId: requestId.current,
        }),
      });
      const json = (await response.json()) as {
        ok?: boolean;
        protocol?: string;
        whatsappUrl?: string;
        urgent?: boolean;
        error?: string;
      };
      if (json.urgent) {
        window.location.assign("/orientacao-urgente");
        return;
      }
      if (!response.ok || !json.ok || !json.protocol || !json.whatsappUrl) {
        setFormError(json.error || "Não foi possível enviar. Tente novamente em alguns minutos.");
        setSending(false);
        return;
      }
      window.location.assign(`/enviado?p=${encodeURIComponent(json.protocol)}`);
    } catch {
      setFormError("Falha de conexão. Verifique a internet e tente novamente.");
      setSending(false);
    }
  }

  const StepView = useMemo(() => {
    const props = { data, set, errors };
    switch (step) {
      case 1:
        return <Step1 {...props} />;
      case 2:
        return <Step2 {...props} />;
      case 3:
        return <Step3 {...props} />;
      case 4:
        return <Step4 {...props} />;
      case 5:
        return <Step5 {...props} />;
      case 6:
        return <Step6 {...props} />;
      default:
        return <Step7 {...props} onEdit={go} />;
    }
  }, [step, data, errors]);

  return (
    <section id="avaliacao" className="mx-auto max-w-3xl px-5 py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-copper">Anamnese inicial</p>
      <h2 className="mt-2 font-serif text-3xl text-teal-deep">Avaliação inicial</h2>
      <p className="mt-3 text-ink-soft">
        Tempo estimado: {SITE.formMinutes}. Você pode voltar às etapas anteriores sem perder o que já
        respondeu nesta sessão. As respostas serão analisadas pelo professor antes de qualquer proposta
        de treino.
      </p>

      <div className="mt-6" role="status" aria-live="polite">
        <div className="mb-2 flex justify-between text-sm font-semibold text-teal">
          <span>
            Etapa {step} de 7 · {TITLES[step - 1]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-sand">
          <div className="h-full rounded-full bg-teal" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form
        className="card mt-8 p-5 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 7) next();
          else void submit();
        }}
        noValidate
      >
        <p className="sr-only">
          <label htmlFor="website">Deixe em branco</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            className="hidden"
            value={data.website}
            onChange={(e) => set({ website: e.target.value })}
          />
        </p>
        <h3 ref={headingRef} tabIndex={-1} className="mb-6 font-serif text-2xl text-teal-deep focus:outline-none">
          {TITLES[step - 1]}
        </h3>
        {StepView}
        {formError ? (
          <p className="mt-6 field-error" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => go(Math.max(1, step - 1))}
            disabled={step === 1 || sending}
          >
            Voltar
          </button>
          {step < 7 ? (
            <button type="submit" className="btn btn-primary">
              Continuar
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={sending}>
              {sending ? "Enviando…" : "Enviar respostas e falar com o professor"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
