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

type RateMap = Record<string, number[]>;

type DbShape = {
  assessments: StoredAssessment[];
  settings: SiteSettings;
  rateLimits: RateMap;
};

function defaultSettings(): SiteSettings {
  return {
    cref: process.env.NEXT_PUBLIC_CREF || "",
    photoPath: process.env.NEXT_PUBLIC_PHOTO_URL || "",
    responsibleName: process.env.PRIVACY_CONTROLLER_NAME || "Professor Nickolas Amaral",
    responsibleEmail: process.env.PRIVACY_CONTACT_EMAIL || "",
    retentionNote: process.env.RETENTION_DAYS ? `${process.env.RETENTION_DAYS} dias` : "",
  };
}

function emptyDb(): DbShape {
  return {
    assessments: [],
    settings: defaultSettings(),
    rateLimits: {},
  };
}

function writableRoot(): string {
  if (process.env.VERCEL) return path.join("/tmp", "nickolas-data");
  return path.join(process.cwd(), "data");
}

function dbFilePath(): string {
  return path.join(writableRoot(), "store.json");
}

async function readDb(file: string): Promise<DbShape> {
  try {
    const raw = await fs.promises.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    return {
      assessments: parsed.assessments ?? [],
      settings: { ...defaultSettings(), ...parsed.settings },
      rateLimits: parsed.rateLimits ?? {},
    };
  } catch {
    return emptyDb();
  }
}

async function writeDb(file: string, data: DbShape): Promise<void> {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(file, JSON.stringify(data));
}

export class AssessmentStore {
  constructor(
    private data: DbShape,
    private persist: (() => Promise<void>) | null,
  ) {}

  static async open(): Promise<AssessmentStore> {
    const file = dbFilePath();
    const data = await readDb(file);
    const store = new AssessmentStore(data, () => writeDb(file, data));
    await store.persist?.();
    return store;
  }

  static async memory(): Promise<AssessmentStore> {
    return new AssessmentStore(emptyDb(), null);
  }

  private async save() {
    if (this.persist) await this.persist();
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
    this.data.assessments.unshift(record);
    await this.save();
    return record;
  }

  async getById(id: string): Promise<StoredAssessment | null> {
    return this.data.assessments.find((item) => item.id === id || item.protocol === id) ?? null;
  }

  async getByClientRequestId(id: string): Promise<StoredAssessment | null> {
    return this.data.assessments.find((item) => item.clientRequestId === id) ?? null;
  }

  async getByMessageId(messageId: string): Promise<StoredAssessment | null> {
    return this.data.assessments.find((item) => item.whatsappMessageId === messageId) ?? null;
  }

  async list(): Promise<StoredAssessment[]> {
    return [...this.data.assessments]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 200);
  }

  async update(id: string, patch: Partial<StoredAssessment>): Promise<StoredAssessment | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const next: StoredAssessment = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.data.assessments = this.data.assessments.map((item) => (item.id === current.id ? next : item));
    await this.save();
    return next;
  }

  async getSettings(): Promise<SiteSettings> {
    return { ...defaultSettings(), ...this.data.settings };
  }

  async saveSettings(settings: SiteSettings): Promise<void> {
    this.data.settings = settings;
    await this.save();
  }

  async hitRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const now = Date.now();
    const hits = (this.data.rateLimits[key] ?? []).filter((time) => now - time < windowMs);
    hits.push(now);
    this.data.rateLimits[key] = hits;
    await this.save();
    return hits.length > limit;
  }
}

let singleton: Promise<AssessmentStore> | null = null;

export function getStore(): Promise<AssessmentStore> {
  if (!singleton) singleton = AssessmentStore.open();
  return singleton;
}

export function pdfDir(): string {
  const dir = path.join(writableRoot(), "pdfs");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function uploadsDir(): string {
  const dir = path.join(writableRoot(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function savePdfFile(protocol: string, bytes: Uint8Array): Promise<string> {
  const filename = `${protocol}.pdf`;
  await fs.promises.writeFile(path.join(pdfDir(), filename), bytes);
  return filename;
}

export async function readPdfFile(filename: string): Promise<Buffer | null> {
  const safe = path.basename(filename);
  if (!safe.endsWith(".pdf")) return null;
  const full = path.join(pdfDir(), safe);
  if (!fs.existsSync(full)) return null;
  return fs.promises.readFile(full);
}
