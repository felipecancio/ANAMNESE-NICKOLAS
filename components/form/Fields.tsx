"use client";

import type { ReactNode } from "react";

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-2">
      <label className="block font-semibold text-teal-deep" htmlFor={id}>
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}>{children}</div>
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input type="text" {...props} className={`field-control ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`field-control ${props.className ?? ""}`} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`field-control ${props.className ?? ""}`} />;
}

export function ChoiceGroup({
  legend,
  error,
  hint,
  children,
}: {
  legend: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-semibold text-teal-deep">{legend}</legend>
      {hint ? <p className="text-sm text-ink-soft">{hint}</p> : null}
      <div className="grid gap-2">{children}</div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

export function Radio({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="choice" data-checked={checked}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
      />
      <span>{children}</span>
    </label>
  );
}

export function Check({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="choice" data-checked={checked}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}

export function Scale({
  name,
  value,
  onChange,
  error,
  label,
}: {
  name: string;
  value: number | "" | "nao_sei" | "prefiro_explicar";
  onChange: (value: number | "nao_sei" | "prefiro_explicar") => void;
  error?: string;
  label: string;
}) {
  return (
    <fieldset className="space-y-3">
      <legend className="font-semibold text-teal-deep">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            className={`min-h-12 min-w-12 rounded-xl border text-base font-semibold ${
              value === n ? "border-teal bg-teal text-paper" : "border-line bg-white"
            }`}
            onClick={() => onChange(n)}
            aria-pressed={value === n}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Radio
          name={`${name}-soft`}
          value="nao_sei"
          checked={value === "nao_sei"}
          onChange={() => onChange("nao_sei")}
        >
          Não sei
        </Radio>
        <Radio
          name={`${name}-soft`}
          value="prefiro_explicar"
          checked={value === "prefiro_explicar"}
          onChange={() => onChange("prefiro_explicar")}
        >
          Prefiro explicar na conversa
        </Radio>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
