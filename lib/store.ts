import { createClient, type Client } from "@libsql/client";
import fs from "fs";
import path from "path";
import { protocolCode, randomId } from "./crypto";
import type {
  AssessmentAnswers,
  AssessmentStatus,
  PriorityFlag,
  SiteSettings,
  StoredAssessment,
  WhatsappStatus,
} from "./types";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS assessments (
  id TEXT PRIMARY KEY,
  protocol TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL,
  payload TEXT NOT NULL,
  flags TEXT NOT NULL,
  skipped_questions TEXT NOT NULL,
  whatsapp_status TEXT NOT NULL,
  whatsapp_message_id TEXT,
  whatsapp_error TEXT,
  whatsapp_attempts INTEGER NOT NULL DEFAULT 0,
  last_whatsapp_attempt_at TEXT,
  pdf_filename TEXT,
  client_request_id TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  cref TEXT,
  photo_path TEXT,
  responsible_name TEXT,
  responsible_email TEXT,
  retention_note TEXT,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key_hash TEXT PRIMARY KEY,
  hits TEXT NOT NULL
);
`;

function rowToAssessment(row: Record<string, unknown>): StoredAssessment {
  return {
    id: String(row.id),
    protocol: String(row.protocol),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    status: String(row.status) as AssessmentStatus,
    answers: JSON.parse(String(row.payload)) as AssessmentAnswers,
    flags: JSON.parse(String(row.flags)) as PriorityFlag[],
    skippedQuestionIds: JSON.parse(String(row.skipped_questions)) as string[],
    whatsappStatus: String(row.whatsapp_status) as WhatsappStatus,
    whatsappMessageId: row.whatsapp_message_id ? String(row.whatsapp_message_id) : null,
    whatsappError: row.whatsapp_error ? String(row.whatsapp_error) : null,
    whatsappAttempts: Number(row.whatsapp_attempts ?? 0),
    lastWhatsappAttemptAt: row.last_whatsapp_attempt_at ? String(row.last_whatsapp_attempt_at) : null,
    pdfFilename: row.pdf_filename ? String(row.pdf_filename) : null,
    clientRequestId: String(row.client_request_id),
  };
}

export class AssessmentStore {
  constructor(private client: Client) {}

  static async open(url?: string): Promise<AssessmentStore> {
    const dbUrl = url || process.env.DATABASE_URL || "file:./data/avaliacoes.db";
    if (dbUrl.startsWith("file:")) {
      const filePath = dbUrl.replace(/^file:/, "");
      const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      const client = createClient({ url: `file:${abs}` });
      const store = new AssessmentStore(client);
      await store.migrate();
      return store;
    }
    const client = createClient({ url: dbUrl, authToken: process.env.DATABASE_AUTH_TOKEN });
    const store = new AssessmentStore(client);
    await store.migrate();
    return store;
  }

  static async memory(): Promise<AssessmentStore> {
    const client = createClient({ url: ":memory:" });
    const store = new AssessmentStore(client);
    await store.migrate();
    return store;
  }

  async migrate() {
    await this.client.executeMultiple(SCHEMA);
    const existing = await this.client.execute("SELECT id FROM site_settings WHERE id = 'default'");
    if (existing.rows.length === 0) {
      await this.client.execute({
        sql: `INSERT INTO site_settings (id, cref, photo_path, responsible_name, responsible_email, retention_note, updated_at)
              VALUES ('default', '', '', ?, ?, '', ?)`,
        args: [
          process.env.PRIVACY_CONTROLLER_NAME || "Professor Nickolas Amaral",
          process.env.PRIVACY_CONTACT_EMAIL || "",
          new Date().toISOString(),
        ],
      });
    }
  }

  async create(input: {
    answers: AssessmentAnswers;
    flags: PriorityFlag[];
    skippedQuestionIds: string[];
    status: AssessmentStatus;
    whatsappStatus: WhatsappStatus;
    clientRequestId: string;
  }): Promise<StoredAssessment> {
    const duplicate = await this.getByClientRequestId(input.clientRequestId);
    if (duplicate) return duplicate;

    const now = new Date().toISOString();
    const record: StoredAssessment = {
      id: randomId(),
      protocol: protocolCode(),
      createdAt: now,
      updatedAt: now,
      status: input.status,
      answers: input.answers,
      flags: input.flags,
      skippedQuestionIds: input.skippedQuestionIds,
      whatsappStatus: input.whatsappStatus,
      whatsappMessageId: null,
      whatsappError: null,
      whatsappAttempts: 0,
      lastWhatsappAttemptAt: null,
      pdfFilename: null,
      clientRequestId: input.clientRequestId,
    };

    await this.client.execute({
      sql: `INSERT INTO assessments (
        id, protocol, created_at, updated_at, status, payload, flags, skipped_questions,
        whatsapp_status, whatsapp_message_id, whatsapp_error, whatsapp_attempts,
        last_whatsapp_attempt_at, pdf_filename, client_request_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        record.id,
        record.protocol,
        record.createdAt,
        record.updatedAt,
        record.status,
        JSON.stringify(record.answers),
        JSON.stringify(record.flags),
        JSON.stringify(record.skippedQuestionIds),
        record.whatsappStatus,
        null,
        null,
        0,
        null,
        null,
        record.clientRequestId,
      ],
    });
    return record;
  }

  async getById(id: string): Promise<StoredAssessment | null> {
    const result = await this.client.execute({
      sql: "SELECT * FROM assessments WHERE id = ? OR protocol = ?",
      args: [id, id],
    });
    if (!result.rows[0]) return null;
    return rowToAssessment(result.rows[0] as unknown as Record<string, unknown>);
  }

  async getByClientRequestId(id: string): Promise<StoredAssessment | null> {
    const result = await this.client.execute({
      sql: "SELECT * FROM assessments WHERE client_request_id = ?",
      args: [id],
    });
    if (!result.rows[0]) return null;
    return rowToAssessment(result.rows[0] as unknown as Record<string, unknown>);
  }

  async getByMessageId(messageId: string): Promise<StoredAssessment | null> {
    const result = await this.client.execute({
      sql: "SELECT * FROM assessments WHERE whatsapp_message_id = ?",
      args: [messageId],
    });
    if (!result.rows[0]) return null;
    return rowToAssessment(result.rows[0] as unknown as Record<string, unknown>);
  }

  async list(): Promise<StoredAssessment[]> {
    const result = await this.client.execute(
      "SELECT * FROM assessments ORDER BY created_at DESC LIMIT 200",
    );
    return result.rows.map((row) => rowToAssessment(row as unknown as Record<string, unknown>));
  }

  async update(id: string, patch: Partial<StoredAssessment>): Promise<StoredAssessment | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const next: StoredAssessment = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.client.execute({
      sql: `UPDATE assessments SET
        updated_at = ?, status = ?, payload = ?, flags = ?, skipped_questions = ?,
        whatsapp_status = ?, whatsapp_message_id = ?, whatsapp_error = ?,
        whatsapp_attempts = ?, last_whatsapp_attempt_at = ?, pdf_filename = ?
        WHERE id = ?`,
      args: [
        next.updatedAt,
        next.status,
        JSON.stringify(next.answers),
        JSON.stringify(next.flags),
        JSON.stringify(next.skippedQuestionIds),
        next.whatsappStatus,
        next.whatsappMessageId,
        next.whatsappError,
        next.whatsappAttempts,
        next.lastWhatsappAttemptAt,
        next.pdfFilename,
        next.id,
      ],
    });
    return next;
  }

  async getSettings(): Promise<SiteSettings> {
    const result = await this.client.execute("SELECT * FROM site_settings WHERE id = 'default'");
    const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
    return {
      cref: String(row?.cref ?? process.env.NEXT_PUBLIC_CREF ?? ""),
      photoPath: String(row?.photo_path ?? process.env.NEXT_PUBLIC_PHOTO_URL ?? ""),
      responsibleName: String(row?.responsible_name ?? process.env.PRIVACY_CONTROLLER_NAME ?? "Professor Nickolas Amaral"),
      responsibleEmail: String(row?.responsible_email ?? process.env.PRIVACY_CONTACT_EMAIL ?? ""),
      retentionNote: String(row?.retention_note ?? (process.env.RETENTION_DAYS ? `${process.env.RETENTION_DAYS} dias` : "")),
    };
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    await this.client.execute({
      sql: `UPDATE site_settings SET cref = ?, photo_path = ?, responsible_name = ?, responsible_email = ?, retention_note = ?, updated_at = ? WHERE id = 'default'`,
      args: [
        settings.cref,
        settings.photoPath,
        settings.responsibleName,
        settings.responsibleEmail,
        settings.retentionNote,
        new Date().toISOString(),
      ],
    });
  }

  async hitRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const result = await this.client.execute({
      sql: "SELECT hits FROM rate_limits WHERE key_hash = ?",
      args: [key],
    });
    const hits: number[] = result.rows[0]
      ? (JSON.parse(String(result.rows[0].hits)) as number[]).filter((t) => now - t < windowMs)
      : [];
    hits.push(now);
    await this.client.execute({
      sql: "INSERT INTO rate_limits (key_hash, hits) VALUES (?, ?) ON CONFLICT(key_hash) DO UPDATE SET hits = excluded.hits",
      args: [key, JSON.stringify(hits)],
    });
    return hits.length > limit;
  }
}

let singleton: Promise<AssessmentStore> | null = null;

export function getStore(): Promise<AssessmentStore> {
  if (!singleton) singleton = AssessmentStore.open();
  return singleton;
}

export function pdfDir(): string {
  const dir = path.join(process.cwd(), "data", "pdfs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function uploadsDir(): string {
  const dir = path.join(process.cwd(), "data", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function savePdfFile(protocol: string, bytes: Uint8Array): Promise<string> {
  const filename = `${protocol}.pdf`;
  const full = path.join(pdfDir(), filename);
  await fs.promises.writeFile(full, bytes);
  return filename;
}

export async function readPdfFile(filename: string): Promise<Buffer | null> {
  const safe = path.basename(filename);
  if (!safe.endsWith(".pdf")) return null;
  const full = path.join(pdfDir(), safe);
  if (!fs.existsSync(full)) return null;
  return fs.promises.readFile(full);
}
