"use client";

import { ESTADOS_BR } from "@/lib/site";
import {
  ATIVIDADES_OPCOES,
  CAPACIDADE_OPTIONS,
  EQUIPAMENTOS_OPCOES,
  MOTIVO_OPTIONS,
  REGIOES_CORPO,
  SOFT_TRI_OPTIONS,
  TRI_OPTIONS,
} from "@/lib/labels";
import {
  showBarrierOther,
  showCaregiverFields,
  showDiagnosisInformed,
  showDiagnosisSpecify,
  showEventDetails,
  showFallsBlock,
  showFallCount,
  showFearDetails,
  showHelpDetails,
  showMedicationDetails,
  showMotiveOther,
  showPhysioOngoing,
  showPracticeDetails,
  showRecommendationDetails,
  showSupportDetails,
  showSurgeryDetails,
  showTreatmentDetails,
  skipInjuryBlock,
} from "@/lib/branching";
import type { AssessmentAnswers } from "@/lib/types";
import { Check, ChoiceGroup, Field, Radio, Scale, Select, TextArea, TextInput } from "./Fields";

type Props = {
  data: AssessmentAnswers;
  set: (patch: Partial<AssessmentAnswers>) => void;
  errors: Record<string, string>;
};

export function Step1({ data, set, errors }: Props) {
  return (
    <div className="space-y-6">
      <Field id="nomeCompleto" label="Nome completo" error={errors.nomeCompleto}>
        <TextInput
          id="nomeCompleto"
          autoComplete="name"
          value={data.nomeCompleto}
          onChange={(e) => set({ nomeCompleto: e.target.value })}
        />
      </Field>
      <Field id="idade" label="Idade (em anos)" error={errors.idade}>
        <TextInput
          id="idade"
          inputMode="numeric"
          value={data.idade === "" ? "" : String(data.idade)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            set({ idade: raw === "" ? "" : Number(raw) });
          }}
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="cidade" label="Cidade" error={errors.cidade}>
          <TextInput id="cidade" value={data.cidade} onChange={(e) => set({ cidade: e.target.value })} />
        </Field>
        <Field id="estado" label="Estado" error={errors.estado}>
          <Select id="estado" value={data.estado} onChange={(e) => set({ estado: e.target.value })}>
            <option value="">Selecione</option>
            {ESTADOS_BR.map((uf) => (
              <option key={uf.uf} value={uf.uf}>
                {uf.uf} — {uf.nome}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        id="whatsapp"
        label="WhatsApp com DDD"
        hint="Usado para o professor retomar o contato. Exemplo: (22) 99723-1553."
        error={errors.whatsapp}
      >
        <TextInput
          id="whatsapp"
          inputMode="tel"
          autoComplete="tel"
          value={data.whatsapp}
          onChange={(e) => set({ whatsapp: e.target.value })}
        />
      </Field>
      <Field id="email" label="E-mail (opcional)" error={errors.email}>
        <TextInput
          id="email"
          type="email"
          autoComplete="email"
          value={data.email}
          onChange={(e) => set({ email: e.target.value })}
        />
      </Field>
      <ChoiceGroup legend="Quem está preenchendo?" error={errors.preenchidoPor}>
        <Radio name="preenchidoPor" value="propria" checked={data.preenchidoPor === "propria"} onChange={(v) => set({ preenchidoPor: v as AssessmentAnswers["preenchidoPor"] })}>
          A própria pessoa que será acompanhada
        </Radio>
        <Radio name="preenchidoPor" value="familiar" checked={data.preenchidoPor === "familiar"} onChange={(v) => set({ preenchidoPor: v as AssessmentAnswers["preenchidoPor"] })}>
          Familiar ou cuidador
        </Radio>
      </ChoiceGroup>
      {showCaregiverFields(data) ? (
        <div className="space-y-6 rounded-2xl border border-line bg-white p-4">
          <Field id="familiarNome" label="Seu nome" error={errors.familiarNome}>
            <TextInput id="familiarNome" value={data.familiarNome} onChange={(e) => set({ familiarNome: e.target.value })} />
          </Field>
          <Field id="familiarVinculo" label="Vínculo com a pessoa atendida" error={errors.familiarVinculo}>
            <TextInput id="familiarVinculo" value={data.familiarVinculo} onChange={(e) => set({ familiarVinculo: e.target.value })} />
          </Field>
          <ChoiceGroup legend="A pessoa atendida sabe deste contato?" error={errors.familiarCiencia}>
            <Check checked={data.familiarCiencia} onChange={(v) => set({ familiarCiencia: v })}>
              Sim, ela sabe que estou preenchendo esta avaliação inicial.
            </Check>
          </ChoiceGroup>
        </div>
      ) : null}
      <ChoiceGroup legend="Melhor período para contato" error={errors.melhorPeriodo}>
        {[
          ["manha", "Manhã"],
          ["tarde", "Tarde"],
          ["noite", "Noite"],
          ["qualquer", "Qualquer período"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
        ].map(([value, label]) => (
          <Radio
            key={value}
            name="melhorPeriodo"
            value={value}
            checked={data.melhorPeriodo === value}
            onChange={(v) => set({ melhorPeriodo: v as AssessmentAnswers["melhorPeriodo"] })}
          >
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
    </div>
  );
}

export function Step2({ data, set, errors }: Props) {
  const toggleAtividade = (item: string) => {
    const has = data.atividadesDesejadas.includes(item);
    if (has) set({ atividadesDesejadas: data.atividadesDesejadas.filter((x) => x !== item) });
    else if (data.atividadesDesejadas.length < 3) set({ atividadesDesejadas: [...data.atividadesDesejadas, item] });
  };
  return (
    <div className="space-y-6">
      <ChoiceGroup legend="Qual é o principal motivo para procurar acompanhamento?" error={errors.motivoPrincipal}>
        {MOTIVO_OPTIONS.map((option) => (
          <Radio
            key={option.value}
            name="motivoPrincipal"
            value={option.value}
            checked={data.motivoPrincipal === option.value}
            onChange={(v) => set({ motivoPrincipal: v as AssessmentAnswers["motivoPrincipal"] })}
          >
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showMotiveOther(data) ? (
        <Field id="motivoOutro" label="Qual outro motivo?" error={errors.motivoOutro}>
          <TextInput id="motivoOutro" value={data.motivoOutro} onChange={(e) => set({ motivoOutro: e.target.value })} />
        </Field>
      ) : null}
      <Field id="dificuldadePrincipal" label="Qual é a principal dificuldade atualmente?" error={errors.dificuldadePrincipal}>
        <TextArea id="dificuldadePrincipal" maxLength={800} value={data.dificuldadePrincipal} onChange={(e) => set({ dificuldadePrincipal: e.target.value })} />
      </Field>
      <ChoiceGroup
        legend="Quais atividades você gostaria de voltar a fazer ou fazer com mais segurança?"
        hint="Até três opções. Se preferir, descreva outra no campo abaixo."
        error={errors.atividadesDesejadas}
      >
        {ATIVIDADES_OPCOES.map((item) => (
          <Check key={item} checked={data.atividadesDesejadas.includes(item)} onChange={() => toggleAtividade(item)}>
            {item}
          </Check>
        ))}
      </ChoiceGroup>
      <Field id="atividadesOutra" label="Outra atividade (opcional)">
        <TextInput id="atividadesOutra" value={data.atividadesOutra} onChange={(e) => set({ atividadesOutra: e.target.value })} />
      </Field>
      <Field id="objetivoProximosMeses" label="Qual é o objetivo mais importante nos próximos meses?" error={errors.objetivoProximosMeses}>
        <TextArea id="objetivoProximosMeses" maxLength={800} value={data.objetivoProximosMeses} onChange={(e) => set({ objetivoProximosMeses: e.target.value })} />
      </Field>
      <ChoiceGroup legend="Existe algum receio relacionado à prática de exercícios?" error={errors.receioExercicios}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="receioExercicios" value={option.value} checked={data.receioExercicios === option.value} onChange={(v) => set({ receioExercicios: v as AssessmentAnswers["receioExercicios"] })}>
            {option.label}
          </Radio>
        ))}
        <Radio name="receioExercicios" value="nao_se_aplica" checked={data.receioExercicios === "nao_se_aplica"} onChange={(v) => set({ receioExercicios: v as AssessmentAnswers["receioExercicios"] })}>
          Não se aplica
        </Radio>
      </ChoiceGroup>
      {showFearDetails(data) ? (
        <Field id="receioDetalhe" label="Qual é o receio?" error={errors.receioDetalhe}>
          <TextArea id="receioDetalhe" value={data.receioDetalhe} onChange={(e) => set({ receioDetalhe: e.target.value })} />
        </Field>
      ) : null}
    </div>
  );
}

function TriField({
  legend,
  name,
  value,
  error,
  onChange,
  extra,
}: {
  legend: string;
  name: string;
  value: string;
  error?: string;
  extra?: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <ChoiceGroup legend={legend} error={error}>
      {TRI_OPTIONS.map((option) => (
        <Radio key={option.value} name={name} value={option.value} checked={value === option.value} onChange={onChange}>
          {option.label}
        </Radio>
      ))}
      {extra?.map((option) => (
        <Radio key={option.value} name={name} value={option.value} checked={value === option.value} onChange={onChange}>
          {option.label}
        </Radio>
      ))}
    </ChoiceGroup>
  );
}

export function Step3({ data, set, errors }: Props) {
  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-sand/70 p-4 text-base text-ink">
        Se você estiver sentindo algo grave agora, procure atendimento médico. Em emergência no Brasil, ligue 192 (SAMU). Este formulário não é um canal de urgência.
      </p>
      <TriField legend="Algum profissional de saúde já orientou limitar ou adaptar exercícios?" name="orientacaoLimitarExercicios" value={data.orientacaoLimitarExercicios} error={errors.orientacaoLimitarExercicios} onChange={(v) => set({ orientacaoLimitarExercicios: v as AssessmentAnswers["orientacaoLimitarExercicios"] })} />
      <TriField legend="Há diagnóstico relevante de doença cardíaca, respiratória, metabólica, neurológica, hipertensão, osteoporose ou outra condição que afete o exercício?" name="diagnosticoRelevante" value={data.diagnosticoRelevante} error={errors.diagnosticoRelevante} onChange={(v) => set({ diagnosticoRelevante: v as AssessmentAnswers["diagnosticoRelevante"] })} />
      {showDiagnosisSpecify(data) && data.diagnosticoRelevante === "sim" ? (
        <Field id="diagnosticoEspecificar" label="O que foi informado pelo profissional de saúde?" hint="Não é necessário anexar exames." error={errors.diagnosticoEspecificar}>
          <TextArea id="diagnosticoEspecificar" value={data.diagnosticoEspecificar} onChange={(e) => set({ diagnosticoEspecificar: e.target.value })} />
        </Field>
      ) : null}
      <TriField legend="Há dor ou pressão no peito durante esforço?" name="dorPeitoEsforco" value={data.dorPeitoEsforco} error={errors.dorPeitoEsforco} onChange={(v) => set({ dorPeitoEsforco: v as AssessmentAnswers["dorPeitoEsforco"] })} />
      <TriField legend="Há falta de ar intensa ou desproporcional ao esforço?" name="faltaArDesproporcional" value={data.faltaArDesproporcional} error={errors.faltaArDesproporcional} onChange={(v) => set({ faltaArDesproporcional: v as AssessmentAnswers["faltaArDesproporcional"] })} />
      <TriField legend="Houve desmaio ou quase desmaio?" name="desmaio" value={data.desmaio} error={errors.desmaio} onChange={(v) => set({ desmaio: v as AssessmentAnswers["desmaio"] })} />
      <TriField legend="Há tonturas recorrentes?" name="tonturasRecorrentes" value={data.tonturasRecorrentes} error={errors.tonturasRecorrentes} onChange={(v) => set({ tonturasRecorrentes: v as AssessmentAnswers["tonturasRecorrentes"] })} />
      <TriField legend="Há fraqueza neurológica nova (braço, perna, fala ou um lado do corpo)?" name="fraquezaNeurologicaNova" value={data.fraquezaNeurologicaNova} error={errors.fraquezaNeurologicaNova} onChange={(v) => set({ fraquezaNeurologicaNova: v as AssessmentAnswers["fraquezaNeurologicaNova"] })} />
      <TriField legend="Houve perda recente de controle urinário ou intestinal associada a dor nas costas?" name="perdaControleEsfincterComDorLombar" value={data.perdaControleEsfincterComDorLombar} error={errors.perdaControleEsfincterComDorLombar} onChange={(v) => set({ perdaControleEsfincterComDorLombar: v as AssessmentAnswers["perdaControleEsfincterComDorLombar"] })} />
      <TriField legend="Houve cirurgia, internação ou atendimento de urgência recente?" name="cirurgiaInternacaoRecente" value={data.cirurgiaInternacaoRecente} error={errors.cirurgiaInternacaoRecente} onChange={(v) => set({ cirurgiaInternacaoRecente: v as AssessmentAnswers["cirurgiaInternacaoRecente"] })} />
      {showSurgeryDetails(data) ? (
        <Field id="cirurgiaQuandoPorQue" label="Quando ocorreu e por quê?" error={errors.cirurgiaQuandoPorQue}>
          <TextArea id="cirurgiaQuandoPorQue" value={data.cirurgiaQuandoPorQue} onChange={(e) => set({ cirurgiaQuandoPorQue: e.target.value })} />
        </Field>
      ) : null}
      <TriField legend="Faz tratamento médico ou fisioterapêutico atualmente?" name="tratamentoAtual" value={data.tratamentoAtual} error={errors.tratamentoAtual} onChange={(v) => set({ tratamentoAtual: v as AssessmentAnswers["tratamentoAtual"] })} />
      {showTreatmentDetails(data) ? (
        <Field id="tratamentoDetalhes" label="Qual tratamento, de forma geral?" error={errors.tratamentoDetalhes}>
          <TextArea id="tratamentoDetalhes" value={data.tratamentoDetalhes} onChange={(e) => set({ tratamentoDetalhes: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Usa medicamentos que possam influenciar disposição, pressão arterial, equilíbrio ou exercício?" hint="Não é necessário informar dose nem receita." error={errors.medicamentos}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="medicamentos" value={option.value} checked={data.medicamentos === option.value} onChange={(v) => set({ medicamentos: v as AssessmentAnswers["medicamentos"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showMedicationDetails(data) && data.medicamentos === "sim" ? (
        <Field id="medicamentosGeral" label="Informação geral (sem dose)">
          <TextArea id="medicamentosGeral" value={data.medicamentosGeral} onChange={(e) => set({ medicamentosGeral: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Recebeu orientação ou liberação para retomar exercícios após lesão ou cirurgia?" error={errors.liberacaoExercicios}>
        {[
          ["sim", "Sim"],
          ["nao", "Não"],
          ["ainda_nao", "Ainda não"],
          ["nao_se_aplica", "Não se aplica"],
          ["nao_sei", "Não sei"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
        ].map(([value, label]) => (
          <Radio key={value} name="liberacaoExercicios" value={value} checked={data.liberacaoExercicios === value} onChange={(v) => set({ liberacaoExercicios: v as AssessmentAnswers["liberacaoExercicios"] })}>
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Há alguma recomendação específica do profissional que acompanha o caso?" error={errors.recomendacaoEspecifica}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="recomendacaoEspecifica" value={option.value} checked={data.recomendacaoEspecifica === option.value} onChange={(v) => set({ recomendacaoEspecifica: v as AssessmentAnswers["recomendacaoEspecifica"] })}>
            {option.label}
          </Radio>
        ))}
        <Radio name="recomendacaoEspecifica" value="nao_se_aplica" checked={data.recomendacaoEspecifica === "nao_se_aplica"} onChange={(v) => set({ recomendacaoEspecifica: v as AssessmentAnswers["recomendacaoEspecifica"] })}>
          Não se aplica
        </Radio>
      </ChoiceGroup>
      {showRecommendationDetails(data) ? (
        <Field id="recomendacaoDetalhes" label="Qual recomendação foi informada?" error={errors.recomendacaoDetalhes}>
          <TextArea id="recomendacaoDetalhes" value={data.recomendacaoDetalhes} onChange={(e) => set({ recomendacaoDetalhes: e.target.value })} />
        </Field>
      ) : null}
    </div>
  );
}

export function Step4({ data, set, errors }: Props) {
  const toggleRegiao = (item: string) => {
    const has = data.regiaoAfetada.includes(item);
    set({
      regiaoAfetada: has ? data.regiaoAfetada.filter((x) => x !== item) : [...data.regiaoAfetada, item],
    });
  };
  return (
    <div className="space-y-6">
      <ChoiceGroup legend="Você tem atualmente lesão, dor ou limitação física que queira detalhar nesta avaliação?" error={errors.relataLesaoDor}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="relataLesaoDor" value={option.value} checked={data.relataLesaoDor === option.value} onChange={(v) => set({ relataLesaoDor: v as AssessmentAnswers["relataLesaoDor"] })}>
            {option.label}
          </Radio>
        ))}
        <Radio name="relataLesaoDor" value="nao_se_aplica" checked={data.relataLesaoDor === "nao_se_aplica"} onChange={(v) => set({ relataLesaoDor: v as AssessmentAnswers["relataLesaoDor"] })}>
          Não se aplica
        </Radio>
      </ChoiceGroup>
      {skipInjuryBlock(data) ? null : (
        <InjuryFields data={data} set={set} errors={errors} toggleRegiao={toggleRegiao} />
      )}
    </div>
  );
}

function InjuryFields({
  data,
  set,
  errors,
  toggleRegiao,
}: Props & { toggleRegiao: (item: string) => void }) {
  return (
    <div className="space-y-6">
      <ChoiceGroup legend="Região do corpo afetada" error={errors.regiaoAfetada}>
        {REGIOES_CORPO.map((item) => (
          <Check key={item} checked={data.regiaoAfetada.includes(item)} onChange={() => toggleRegiao(item)}>
            {item}
          </Check>
        ))}
      </ChoiceGroup>
      {data.regiaoAfetada.includes("Outra") ? (
        <Field id="regiaoOutra" label="Qual outra região?">
          <TextInput id="regiaoOutra" value={data.regiaoOutra} onChange={(e) => set({ regiaoOutra: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Lado" error={errors.ladoAfetado}>
        {[
          ["direito", "Direito"],
          ["esquerdo", "Esquerdo"],
          ["ambos", "Ambos"],
          ["nao_se_aplica", "Não se aplica"],
          ["nao_sei", "Não sei"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
        ].map(([value, label]) => (
          <Radio key={value} name="ladoAfetado" value={value} checked={data.ladoAfetado === value} onChange={(v) => set({ ladoAfetado: v as AssessmentAnswers["ladoAfetado"] })}>
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Houve diagnóstico feito por profissional?" error={errors.diagnosticoProfissional}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="diagnosticoProfissional" value={option.value} checked={data.diagnosticoProfissional === option.value} onChange={(v) => set({ diagnosticoProfissional: v as AssessmentAnswers["diagnosticoProfissional"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showDiagnosisInformed(data) ? (
        <Field id="diagnosticoInformado" label="Qual foi o diagnóstico informado?" hint="Repita o que foi dito a você. Isso não se torna um diagnóstico automático nesta página." error={errors.diagnosticoInformado}>
          <TextArea id="diagnosticoInformado" value={data.diagnosticoInformado} onChange={(e) => set({ diagnosticoInformado: e.target.value })} />
        </Field>
      ) : null}
      <Field id="inicioQuando" label="Quando começou?" error={errors.inicioQuando}>
        <TextInput id="inicioQuando" value={data.inicioQuando} onChange={(e) => set({ inicioQuando: e.target.value })} />
      </Field>
      <ChoiceGroup legend="Houve um evento específico?" error={errors.eventoEspecifico}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="eventoEspecifico" value={option.value} checked={data.eventoEspecifico === option.value} onChange={(v) => set({ eventoEspecifico: v as AssessmentAnswers["eventoEspecifico"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showEventDetails(data) ? (
        <Field id="eventoDetalhe" label="Qual evento?">
          <TextInput id="eventoDetalhe" value={data.eventoDetalhe} onChange={(e) => set({ eventoDetalhe: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Em que fase a lesão se encontra, se souber?" error={errors.faseLesao}>
        {[
          ["recente", "Fase recente"],
          ["em_tratamento", "Em tratamento"],
          ["apos_cirurgia", "Após cirurgia"],
          ["acompanhamento_longo", "Acompanhamento de longo prazo"],
          ["nao_sei", "Não sei"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
          ["nao_se_aplica", "Não se aplica"],
        ].map(([value, label]) => (
          <Radio key={value} name="faseLesao" value={value} checked={data.faseLesao === value} onChange={(v) => set({ faseLesao: v as AssessmentAnswers["faseLesao"] })}>
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
      <ChoiceGroup legend="Fez fisioterapia ou outro acompanhamento?" error={errors.fisioterapia}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="fisioterapia" value={option.value} checked={data.fisioterapia === option.value} onChange={(v) => set({ fisioterapia: v as AssessmentAnswers["fisioterapia"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showPhysioOngoing(data) ? (
        <ChoiceGroup legend="Esse acompanhamento está em andamento?" error={errors.fisioterapiaAndamento}>
          {SOFT_TRI_OPTIONS.map((option) => (
            <Radio key={option.value} name="fisioterapiaAndamento" value={option.value} checked={data.fisioterapiaAndamento === option.value} onChange={(v) => set({ fisioterapiaAndamento: v as AssessmentAnswers["fisioterapiaAndamento"] })}>
              {option.label}
            </Radio>
          ))}
        </ChoiceGroup>
      ) : null}
      <Scale name="dorRepouso" label="Dor atual em repouso (0 a 10)" value={data.dorRepouso} error={errors.dorRepouso} onChange={(v) => set({ dorRepouso: v })} />
      <Scale name="dorMovimento" label="Dor atual durante o movimento (0 a 10)" value={data.dorMovimento} error={errors.dorMovimento} onChange={(v) => set({ dorMovimento: v })} />
      <ChoiceGroup legend="Com que frequência a dor aparece?" error={errors.frequenciaDor}>
        {[
          ["constante", "Constante"],
          ["diaria", "Diária"],
          ["algumas_vezes_semana", "Algumas vezes na semana"],
          ["ocasional", "Ocasional"],
          ["somente_movimento", "Somente durante o movimento"],
          ["nao_sei", "Não sei"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
          ["nao_se_aplica", "Não se aplica"],
        ].map(([value, label]) => (
          <Radio key={value} name="frequenciaDor" value={value} checked={data.frequenciaDor === value} onChange={(v) => set({ frequenciaDor: v as AssessmentAnswers["frequenciaDor"] })}>
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
      <Field id="oQuePiora" label="Quais movimentos ou atividades pioram?" error={errors.oQuePiora}>
        <TextArea id="oQuePiora" value={data.oQuePiora} onChange={(e) => set({ oQuePiora: e.target.value })} />
      </Field>
      <Field id="oQueAlivia" label="Quais movimentos ou atividades aliviam?" error={errors.oQueAlivia}>
        <TextArea id="oQueAlivia" value={data.oQueAlivia} onChange={(e) => set({ oQueAlivia: e.target.value })} />
      </Field>
      <TriField legend="Existe perda de força?" name="perdaForca" value={data.perdaForca} error={errors.perdaForca} onChange={(v) => set({ perdaForca: v as AssessmentAnswers["perdaForca"] })} />
      <TriField legend="Existe dormência ou formigamento?" name="dormenciaFormigamento" value={data.dormenciaFormigamento} error={errors.dormenciaFormigamento} onChange={(v) => set({ dormenciaFormigamento: v as AssessmentAnswers["dormenciaFormigamento"] })} />
      <TriField legend="Existe sensação de instabilidade?" name="instabilidade" value={data.instabilidade} error={errors.instabilidade} onChange={(v) => set({ instabilidade: v as AssessmentAnswers["instabilidade"] })} />
      <Field id="movimentosEvitar" label="Quais movimentos foram orientados a evitar?" error={errors.movimentosEvitar} hint="Se não houver orientação, escreva “não se aplica” ou “não sei”.">
        <TextArea id="movimentosEvitar" value={data.movimentosEvitar} onChange={(e) => set({ movimentosEvitar: e.target.value })} />
      </Field>
      <TriField legend="A limitação interfere no sono?" name="interfereSono" value={data.interfereSono} error={errors.interfereSono} onChange={(v) => set({ interfereSono: v as AssessmentAnswers["interfereSono"] })} />
      <TriField legend="A limitação interfere no trabalho?" name="interfereTrabalho" value={data.interfereTrabalho} error={errors.interfereTrabalho} onChange={(v) => set({ interfereTrabalho: v as AssessmentAnswers["interfereTrabalho"] })} />
      <TriField legend="A limitação interfere nas atividades cotidianas?" name="interfereCotidiano" value={data.interfereCotidiano} error={errors.interfereCotidiano} onChange={(v) => set({ interfereCotidiano: v as AssessmentAnswers["interfereCotidiano"] })} />
    </div>
  );
}

export function Step5({ data, set, errors }: Props) {
  return (
    <div className="space-y-6">
      <p className="text-ink-soft">
        Avalie cada atividade como você a percebe hoje. Idade sozinha não indica incapacidade.
      </p>
      {[
        ["capacidadeCaminhar", "Caminhar"],
        ["capacidadeEscadas", "Subir escadas"],
        ["capacidadeLevantarCadeira", "Levantar de uma cadeira"],
        ["capacidadeCarregarLeve", "Carregar objetos leves"],
        ["capacidadeEquilibrio", "Manter o equilíbrio"],
      ].map(([key, label]) => (
        <ChoiceGroup key={key} legend={label} error={errors[key]}>
          {CAPACIDADE_OPTIONS.map((option) => (
            <Radio
              key={option.value}
              name={key}
              value={option.value}
              checked={data[key as keyof AssessmentAnswers] === option.value}
              onChange={(v) => set({ [key]: v } as Partial<AssessmentAnswers>)}
            >
              {option.label}
            </Radio>
          ))}
        </ChoiceGroup>
      ))}
      <ChoiceGroup legend="Precisa de ajuda para alguma atividade cotidiana?" error={errors.precisaAjudaCotidiano}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="precisaAjudaCotidiano" value={option.value} checked={data.precisaAjudaCotidiano === option.value} onChange={(v) => set({ precisaAjudaCotidiano: v as AssessmentAnswers["precisaAjudaCotidiano"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showHelpDetails(data) ? (
        <Field id="ajudaQual" label="Qual atividade?" error={errors.ajudaQual}>
          <TextInput id="ajudaQual" value={data.ajudaQual} onChange={(e) => set({ ajudaQual: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Usa bengala, andador ou outro apoio?" error={errors.usaApoio}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="usaApoio" value={option.value} checked={data.usaApoio === option.value} onChange={(v) => set({ usaApoio: v as AssessmentAnswers["usaApoio"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showSupportDetails(data) ? (
        <Field id="apoioQual" label="Qual apoio?" error={errors.apoioQual}>
          <TextInput id="apoioQual" value={data.apoioQual} onChange={(e) => set({ apoioQual: e.target.value })} />
        </Field>
      ) : null}
      <Scale name="confiancaMovimento" label="Como avalia sua confiança para se movimentar, de 0 a 10?" value={data.confiancaMovimento} error={errors.confiancaMovimento} onChange={(v) => set({ confiancaMovimento: v })} />
      {showFallsBlock(data) ? (
        <div className="space-y-6 rounded-2xl border border-line bg-white p-4">
          <p className="font-semibold text-teal-deep">Perguntas adicionais de equilíbrio e segurança</p>
          <p className="text-sm text-ink-soft">
            Elas aparecem porque a idade é 60 anos ou mais, ou porque houve relato de instabilidade ou quedas. Não significam, por si só, que a pessoa não possa treinar.
          </p>
          <TriField legend="Caiu nos últimos 12 meses?" name="caiu12Meses" value={data.caiu12Meses} error={errors.caiu12Meses} onChange={(v) => set({ caiu12Meses: v as AssessmentAnswers["caiu12Meses"] })} />
          {showFallCount(data) ? (
            <>
              <Field id="quedasQuantidade" label="Quantas vezes?" error={errors.quedasQuantidade}>
                <TextInput id="quedasQuantidade" value={data.quedasQuantidade} onChange={(e) => set({ quedasQuantidade: e.target.value })} />
              </Field>
              <TriField legend="Houve lesão em alguma queda?" name="quedaComLesao" value={data.quedaComLesao} error={errors.quedaComLesao} onChange={(v) => set({ quedaComLesao: v as AssessmentAnswers["quedaComLesao"] })} />
            </>
          ) : null}
          <TriField legend="Sente-se inseguro ao ficar em pé ou caminhar?" name="inseguroEmPeOuCaminhar" value={data.inseguroEmPeOuCaminhar} error={errors.inseguroEmPeOuCaminhar} onChange={(v) => set({ inseguroEmPeOuCaminhar: v as AssessmentAnswers["inseguroEmPeOuCaminhar"] })} />
          <TriField legend="Tem medo de cair?" name="medoDeCair" value={data.medoDeCair} error={errors.medoDeCair} onChange={(v) => set({ medoDeCair: v as AssessmentAnswers["medoDeCair"] })} />
          <TriField legend="Há dificuldade para enxergar ou obstáculos frequentes no ambiente em que se movimenta?" name="dificuldadeEnxergarOuObstaculos" value={data.dificuldadeEnxergarOuObstaculos} error={errors.dificuldadeEnxergarOuObstaculos} onChange={(v) => set({ dificuldadeEnxergarOuObstaculos: v as AssessmentAnswers["dificuldadeEnxergarOuObstaculos"] })} />
          <ChoiceGroup legend="Alguém costuma acompanhar suas atividades físicas?" error={errors.alguemAcompanhaAtividades}>
            {SOFT_TRI_OPTIONS.map((option) => (
              <Radio key={option.value} name="alguemAcompanhaAtividades" value={option.value} checked={data.alguemAcompanhaAtividades === option.value} onChange={(v) => set({ alguemAcompanhaAtividades: v as AssessmentAnswers["alguemAcompanhaAtividades"] })}>
                {option.label}
              </Radio>
            ))}
          </ChoiceGroup>
        </div>
      ) : null}
    </div>
  );
}

export function Step6({ data, set, errors }: Props) {
  const toggleEquip = (item: string) => {
    if (item === "Nenhum") {
      set({ equipamentos: data.equipamentos.includes("Nenhum") ? [] : ["Nenhum"] });
      return;
    }
    const withoutNone = data.equipamentos.filter((x) => x !== "Nenhum");
    const has = withoutNone.includes(item);
    set({ equipamentos: has ? withoutNone.filter((x) => x !== item) : [...withoutNone, item] });
  };
  return (
    <div className="space-y-6">
      <ChoiceGroup legend="Pratica alguma atividade física atualmente?" error={errors.praticaAtualmente}>
        {SOFT_TRI_OPTIONS.map((option) => (
          <Radio key={option.value} name="praticaAtualmente" value={option.value} checked={data.praticaAtualmente === option.value} onChange={(v) => set({ praticaAtualmente: v as AssessmentAnswers["praticaAtualmente"] })}>
            {option.label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showPracticeDetails(data) ? (
        <div className="grid gap-6">
          <Field id="praticaQual" label="Qual atividade?" error={errors.praticaQual}>
            <TextInput id="praticaQual" value={data.praticaQual} onChange={(e) => set({ praticaQual: e.target.value })} />
          </Field>
          <Field id="praticaFrequencia" label="Quantas vezes por semana?" error={errors.praticaFrequencia}>
            <TextInput id="praticaFrequencia" value={data.praticaFrequencia} onChange={(e) => set({ praticaFrequencia: e.target.value })} />
          </Field>
          <Field id="praticaDuracao" label="Por quanto tempo, em média?" error={errors.praticaDuracao}>
            <TextInput id="praticaDuracao" value={data.praticaDuracao} onChange={(e) => set({ praticaDuracao: e.target.value })} />
          </Field>
        </div>
      ) : null}
      <Field id="oQueNaoFuncionou" label="O que já tentou fazer e não funcionou?" error={errors.oQueNaoFuncionou}>
        <TextArea id="oQueNaoFuncionou" value={data.oQueNaoFuncionou} onChange={(e) => set({ oQueNaoFuncionou: e.target.value })} />
      </Field>
      <Field id="oQueGosta" label="Quais exercícios ou atividades gosta de fazer?" error={errors.oQueGosta}>
        <TextArea id="oQueGosta" value={data.oQueGosta} onChange={(e) => set({ oQueGosta: e.target.value })} />
      </Field>
      <Field id="oQueEvita" label="Quais não gosta, causam desconforto ou prefere evitar?" error={errors.oQueEvita}>
        <TextArea id="oQueEvita" value={data.oQueEvita} onChange={(e) => set({ oQueEvita: e.target.value })} />
      </Field>
      <Field id="tempoPorSessao" label="Quanto tempo consegue reservar, de forma realista, por sessão?" error={errors.tempoPorSessao}>
        <TextInput id="tempoPorSessao" value={data.tempoPorSessao} onChange={(e) => set({ tempoPorSessao: e.target.value })} />
      </Field>
      <Field id="tempoPorSemana" label="E por semana?" error={errors.tempoPorSemana}>
        <TextInput id="tempoPorSemana" value={data.tempoPorSemana} onChange={(e) => set({ tempoPorSemana: e.target.value })} />
      </Field>
      <ChoiceGroup legend="Tem acesso a algum equipamento?" error={errors.equipamentos}>
        {EQUIPAMENTOS_OPCOES.map((item) => (
          <Check key={item} checked={data.equipamentos.includes(item)} onChange={() => toggleEquip(item)}>
            {item}
          </Check>
        ))}
        <Check checked={data.equipamentos.includes("Outros")} onChange={() => toggleEquip("Outros")}>
          Outros
        </Check>
      </ChoiceGroup>
      {data.equipamentos.includes("Outros") ? (
        <Field id="equipamentosOutros" label="Quais outros?">
          <TextInput id="equipamentosOutros" value={data.equipamentosOutros} onChange={(e) => set({ equipamentosOutros: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup legend="Qual é a principal barreira para manter uma rotina?" error={errors.barreiraPrincipal}>
        {[
          ["tempo", "Tempo"],
          ["dor", "Dor"],
          ["medo", "Medo"],
          ["deslocamento", "Deslocamento"],
          ["motivacao", "Motivação"],
          ["outra", "Outra"],
          ["nao_sei", "Não sei"],
          ["prefiro_explicar", "Prefiro explicar na conversa"],
        ].map(([value, label]) => (
          <Radio key={value} name="barreiraPrincipal" value={value} checked={data.barreiraPrincipal === value} onChange={(v) => set({ barreiraPrincipal: v as AssessmentAnswers["barreiraPrincipal"] })}>
            {label}
          </Radio>
        ))}
      </ChoiceGroup>
      {showBarrierOther(data) ? (
        <Field id="barreiraOutra" label="Qual outra barreira?" error={errors.barreiraOutra}>
          <TextInput id="barreiraOutra" value={data.barreiraOutra} onChange={(e) => set({ barreiraOutra: e.target.value })} />
        </Field>
      ) : null}
      <ChoiceGroup
        legend="Prefere conversar sobre acompanhamento presencial, remoto ou ainda não sabe?"
        hint="Esta pergunta registra apenas a sua preferência. Nenhuma modalidade é apresentada como disponível até que o professor confirme."
        error={errors.modalidadeInteresse}
      >
        <Radio name="modalidadeInteresse" value="presencial" checked={data.modalidadeInteresse === "presencial"} onChange={(v) => set({ modalidadeInteresse: v as AssessmentAnswers["modalidadeInteresse"] })}>
          Conversar sobre acompanhamento presencial
        </Radio>
        <Radio name="modalidadeInteresse" value="remoto" checked={data.modalidadeInteresse === "remoto"} onChange={(v) => set({ modalidadeInteresse: v as AssessmentAnswers["modalidadeInteresse"] })}>
          Conversar sobre acompanhamento remoto
        </Radio>
        <Radio name="modalidadeInteresse" value="ainda_nao_sei" checked={data.modalidadeInteresse === "ainda_nao_sei"} onChange={(v) => set({ modalidadeInteresse: v as AssessmentAnswers["modalidadeInteresse"] })}>
          Ainda não sei
        </Radio>
      </ChoiceGroup>
    </div>
  );
}

export function Step7({ data, set, errors, onEdit }: Props & { onEdit: (step: number) => void }) {
  return (
    <div className="space-y-6">
      <p className="text-ink-soft">
        Revise as respostas. Se quiser alterar algo, use Editar. As informações ficam nesta sessão do navegador até o envio e não são gravadas no aparelho.
      </p>
      <SummaryCard title="Identificação" onEdit={() => onEdit(1)}>
        <Line k="Nome" v={data.nomeCompleto} />
        <Line k="Idade" v={String(data.idade)} />
        <Line k="Cidade" v={`${data.cidade} / ${data.estado}`} />
        <Line k="WhatsApp" v={data.whatsapp} />
      </SummaryCard>
      <SummaryCard title="Objetivos" onEdit={() => onEdit(2)}>
        <Line k="Motivo" v={data.motivoPrincipal} />
        <Line k="Objetivo" v={data.objetivoProximosMeses} />
      </SummaryCard>
      <SummaryCard title="Saúde e prontidão" onEdit={() => onEdit(3)}>
        <Line k="Diagnóstico relevante" v={data.diagnosticoRelevante} />
        <Line k="Cirurgia/internação recente" v={data.cirurgiaInternacaoRecente} />
        <Line k="Liberação para exercícios" v={data.liberacaoExercicios} />
      </SummaryCard>
      <SummaryCard title="Lesão e limitações" onEdit={() => onEdit(4)}>
        <Line k="Relata lesão, dor ou limitação" v={data.relataLesaoDor} />
        <Line k="Região" v={data.regiaoAfetada.join(", ") || "Não se aplica"} />
      </SummaryCard>
      <SummaryCard title="Capacidade funcional" onEdit={() => onEdit(5)}>
        <Line k="Caminhar" v={data.capacidadeCaminhar} />
        <Line k="Confiança" v={String(data.confiancaMovimento)} />
      </SummaryCard>
      <SummaryCard title="Rotina" onEdit={() => onEdit(6)}>
        <Line k="Pratica atualmente" v={data.praticaAtualmente} />
        <Line k="Tempo por sessão" v={data.tempoPorSessao} />
        <Line k="Preferência de conversa" v={data.modalidadeInteresse} />
      </SummaryCard>

      <div className="rounded-2xl border border-line bg-sand/60 p-4 text-base">
        <p>
          A análise do professor é individual. Este formulário não substitui avaliação médica ou fisioterapêutica, não faz diagnóstico e não prescreve treino automaticamente.
        </p>
      </div>
      <ChoiceGroup legend="Ciência" error={errors.cienciaNaoSubstituiClinico}>
        <Check checked={data.cienciaNaoSubstituiClinico} onChange={(v) => set({ cienciaNaoSubstituiClinico: v })}>
          Entendi que esta avaliação inicial não substitui consulta clínica e que o professor analisará as respostas antes de qualquer proposta.
        </Check>
      </ChoiceGroup>
      <ChoiceGroup legend="Autorização de dados pessoais e de saúde" error={errors.autorizacaoDadosSaude}>
        <Check checked={data.autorizacaoDadosSaude} onChange={(v) => set({ autorizacaoDadosSaude: v })}>
          Autorizo o tratamento dos meus dados pessoais e de saúde para a finalidade de avaliação inicial e contato com o professor Nickolas Amaral, conforme a Política de Privacidade.
        </Check>
      </ChoiceGroup>
      <ChoiceGroup legend="Envio do relatório" error={errors.cienciaEnvioWhatsapp}>
        <Check checked={data.cienciaEnvioWhatsapp} onChange={(v) => set({ cienciaEnvioWhatsapp: v })}>
          Estou ciente de que o relatório em PDF poderá ser encaminhado ao professor pelo WhatsApp, se essa for a forma de envio configurada.
        </Check>
      </ChoiceGroup>
      <ChoiceGroup legend="Mensagens futuras (opcional, desmarcada)">
        <Check checked={data.consentimentoMarketing} onChange={(v) => set({ consentimentoMarketing: v })}>
          Aceito receber mensagens informativas ou promocionais no futuro. A avaliação inicial não depende desta opção.
        </Check>
      </ChoiceGroup>
    </div>
  );
}

function SummaryCard({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-serif text-xl text-teal-deep">{title}</h3>
        <button type="button" className="text-base font-semibold text-teal underline" onClick={onEdit}>
          Editar
        </button>
      </div>
      <dl className="space-y-2 text-base">{children}</dl>
    </section>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[12rem_1fr]">
      <dt className="font-semibold text-ink-soft">{k}</dt>
      <dd>{v || "—"}</dd>
    </div>
  );
}
