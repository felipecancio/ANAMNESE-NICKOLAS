import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { formatPhoneDisplay, labelOf } from "./labels";
import { buildQuestionRows } from "./questions";
import { SITE } from "./site";
import { summaryForProfessor } from "./triage";
import type { StoredAssessment } from "./types";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 42;
const HEADER = "Avaliação inicial — Professor Nickolas Amaral";
const INK = rgb(0.09, 0.16, 0.16);
const TEAL = rgb(0.1, 0.28, 0.27);
const LINE = rgb(0.82, 0.84, 0.8);
const SOFT = rgb(0.96, 0.95, 0.91);
const FLAG = rgb(0.55, 0.28, 0.12);

type Fonts = { regular: PDFFont; bold: PDFFont };

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const clean = text.replace(/\s+/g, " ").trim() || " ";
  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
      } else {
        let chunk = "";
        for (const ch of word) {
          const trial = chunk + ch;
          if (font.widthOfTextAtSize(trial, size) <= maxWidth) chunk = trial;
          else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

class PdfWriter {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;
  pageIndex = 1;
  pages: PDFPage[];

  constructor(doc: PDFDocument, fonts: Fonts) {
    this.doc = doc;
    this.fonts = fonts;
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.pages = [this.page];
    this.y = PAGE_H - MARGIN;
    this.drawHeader();
  }

  drawHeader() {
    this.page.drawRectangle({
      x: 0,
      y: PAGE_H - 36,
      width: PAGE_W,
      height: 36,
      color: TEAL,
    });
    this.page.drawText(HEADER, {
      x: MARGIN,
      y: PAGE_H - 24,
      size: 10,
      font: this.fonts.bold,
      color: rgb(0.98, 0.97, 0.94),
    });
    this.y = PAGE_H - 52;
  }

  ensure(height: number) {
    if (this.y - height < MARGIN + 28) {
      this.page = this.doc.addPage([PAGE_W, PAGE_H]);
      this.pages.push(this.page);
      this.pageIndex += 1;
      this.drawHeader();
    }
  }

  text(content: string, opts: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb>; indent?: number } = {}) {
    const size = opts.size ?? 10;
    const font = opts.bold ? this.fonts.bold : this.fonts.regular;
    const indent = opts.indent ?? 0;
    const max = PAGE_W - MARGIN * 2 - indent;
    const lines = wrap(content, font, size, max);
    const lineH = size + 4;
    this.ensure(lineH * lines.length);
    for (const line of lines) {
      this.ensure(lineH);
      this.page.drawText(line, {
        x: MARGIN + indent,
        y: this.y - size,
        size,
        font,
        color: opts.color ?? INK,
      });
      this.y -= lineH;
    }
  }

  gap(n = 8) {
    this.y -= n;
  }

  hrule() {
    this.ensure(10);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE_W - MARGIN, y: this.y },
      thickness: 0.6,
      color: LINE,
    });
    this.y -= 10;
  }

  tableRow(pergunta: string, resposta: string, header = false) {
    const qWidth = 220;
    const aWidth = PAGE_W - MARGIN * 2 - qWidth - 16;
    const qLines = wrap(pergunta, header ? this.fonts.bold : this.fonts.regular, 9, qWidth);
    const aLines = wrap(resposta, header ? this.fonts.bold : this.fonts.regular, 9, aWidth);
    const lines = Math.max(qLines.length, aLines.length);
    const height = lines * 12 + 10;
    this.ensure(height);
    if (header) {
      this.page.drawRectangle({
        x: MARGIN,
        y: this.y - height,
        width: PAGE_W - MARGIN * 2,
        height,
        color: TEAL,
      });
    } else {
      this.page.drawRectangle({
        x: MARGIN,
        y: this.y - height,
        width: PAGE_W - MARGIN * 2,
        height,
        color: SOFT,
        borderColor: LINE,
        borderWidth: 0.4,
      });
    }
    const color = header ? rgb(0.98, 0.97, 0.94) : INK;
    const font = header ? this.fonts.bold : this.fonts.regular;
    qLines.forEach((line, i) => {
      this.page.drawText(line, {
        x: MARGIN + 6,
        y: this.y - 14 - i * 12,
        size: 9,
        font,
        color,
      });
    });
    aLines.forEach((line, i) => {
      this.page.drawText(line, {
        x: MARGIN + qWidth + 12,
        y: this.y - 14 - i * 12,
        size: 9,
        font,
        color,
      });
    });
    this.y -= height;
  }

  finish() {
    const total = this.pages.length;
    this.pages.forEach((page, i) => {
      page.drawText(`Página ${i + 1} de ${total}  ·  Documento confidencial — uso do professor`, {
        x: MARGIN,
        y: 22,
        size: 8,
        font: this.fonts.regular,
        color: rgb(0.35, 0.4, 0.38),
      });
    });
  }
}

function sanitizeAnswersForPdf(assessment: StoredAssessment) {
  const copy = structuredClone(assessment);
  delete (copy as { clientRequestId?: string }).clientRequestId;
  return copy;
}

export async function generateAssessmentPdf(assessment: StoredAssessment): Promise<Uint8Array> {
  const safe = sanitizeAnswersForPdf(assessment);
  const doc = await PDFDocument.create();
  doc.setTitle(`Avaliação inicial ${safe.protocol}`);
  doc.setAuthor(SITE.professionalName);
  doc.setSubject("Anamnese inicial para análise do educador físico");
  doc.setCreator("Sistema de avaliação inicial");
  doc.setKeywords([safe.protocol, "avaliacao-inicial"]);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const writer = new PdfWriter(doc, { regular, bold });
  const a = safe.answers;
  const created = new Date(safe.createdAt);
  const when = created.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const summary = summaryForProfessor(a);

  writer.text("Identificação da pessoa", { bold: true, size: 13, color: TEAL });
  writer.gap(4);
  writer.text(`Nome: ${a.nomeCompleto}`);
  writer.text(`Idade: ${a.idade === "" ? "—" : `${a.idade} anos`}`);
  writer.text(`Cidade/UF: ${a.cidade} / ${a.estado}`);
  writer.text(`Telefone: ${formatPhoneDisplay(a.whatsapp)}`);
  writer.text(`E-mail: ${a.email.trim() || "Não informado"}`);
  writer.text(`Data e hora da resposta: ${when}`);
  writer.text(`Identificador único (protocolo): ${safe.protocol}`);
  writer.gap(8);
  writer.hrule();

  writer.text("Resumo inicial para o professor", { bold: true, size: 13, color: TEAL });
  writer.gap(4);
  writer.text(`Objetivo: ${summary.objetivo}`);
  writer.text(`Região afetada: ${summary.regiao}`);
  writer.text(`Nível de dor: ${summary.dor}`);
  writer.text(`Limitações funcionais: ${summary.limitacoes}`);
  writer.gap(6);

  writer.text("Pontos que pedem revisão prioritária", { bold: true, size: 12, color: TEAL });
  writer.gap(3);
  if (safe.flags.length === 0) {
    writer.text("Nenhum sinalizador automático. A análise continua individual.");
  } else {
    writer.text("Estes marcadores não são diagnóstico nem liberação para treinar. Servem apenas para priorizar a leitura.");
    for (const flag of safe.flags) {
      writer.text(`• ${flag.label}`, { color: FLAG, indent: 6 });
    }
  }
  writer.gap(10);

  let currentSection = "";
  for (const item of buildQuestionRows(a)) {
    if (item.section !== currentSection) {
      currentSection = item.section;
      writer.gap(8);
      writer.text(currentSection, { bold: true, size: 12, color: TEAL });
      writer.gap(4);
      writer.tableRow("Pergunta", "Resposta", true);
    }
    writer.tableRow(item.pergunta, item.resposta);
  }

  writer.gap(16);
  writer.text("Observações posteriores do professor", { bold: true, size: 13, color: TEAL });
  writer.gap(4);
  writer.text("Espaço reservado para anotações após a análise individual. Não preenchido pela pessoa avaliada.");
  writer.gap(8);
  for (let i = 0; i < 7; i += 1) {
    writer.ensure(22);
    writer.page.drawLine({
      start: { x: MARGIN, y: writer.y },
      end: { x: PAGE_W - MARGIN, y: writer.y },
      thickness: 0.5,
      color: LINE,
    });
    writer.y -= 22;
  }

  writer.gap(8);
  writer.text(
    "Este documento reúne as respostas da avaliação inicial. Não substitui avaliação médica ou fisioterapêutica e não constitui prescrição de treino.",
    { size: 8, color: rgb(0.3, 0.33, 0.32) },
  );

  writer.finish();
  const bytes = await doc.save();
  return bytes;
}

export function assertPdfHasNoSecrets(bytes: Uint8Array) {
  const text = Buffer.from(bytes).toString("latin1");
  const forbidden = ["WHATSAPP_TOKEN", "ADMIN_PASSWORD", "SERVICE_ROLE", "Bearer ", "sk_live"];
  for (const token of forbidden) {
    if (text.includes(token)) {
      throw new Error("PDF contains forbidden technical content.");
    }
  }
  void labelOf;
}
