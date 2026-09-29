export default function UrgentPage() {
  return (
    <main id="conteudo" className="mx-auto max-w-2xl px-5 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-danger">Orientação de segurança</p>
      <h1 className="mt-3 font-serif text-4xl text-teal-deep">Procure atendimento médico agora</h1>
      <p className="mt-6 text-lg">
        Com base no que foi informado, esta avaliação inicial não deve continuar como pedido de treino.
        Sintomas como dor no peito, falta de ar intensa, desmaio, fraqueza neurológica nova ou perda
        recente de controle urinário ou intestinal com dor nas costas pedem avaliação de saúde imediata.
      </p>
      <p className="mt-6 rounded-2xl bg-sand p-5 text-lg font-semibold text-ink">
        Em emergência no Brasil, ligue 192 (SAMU).
      </p>
      <p className="mt-6 text-ink-soft">
        Não espere resposta pelo WhatsApp e não inicie exercícios a partir desta página. Um profissional
        de saúde deve avaliar a situação presencialmente quando houver urgência.
      </p>
    </main>
  );
}
