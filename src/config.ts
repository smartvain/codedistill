import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { CodeDistillConfig, PushRecord } from "./types";

const CONFIG_DIR = path.join(os.homedir(), ".codedistill");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
const HISTORY_FILE = path.join(CONFIG_DIR, "history.json");

const DEFAULTS: Partial<CodeDistillConfig> = {
  defaultBranch: "main",
  defaultTargetPath: "snippets",
};

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): CodeDistillConfig | null {
  if (!fs.existsSync(CONFIG_FILE)) {
    return null;
  }
  const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
  return { ...DEFAULTS, ...JSON.parse(raw) } as CodeDistillConfig;
}

export function saveConfig(config: CodeDistillConfig): void {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  fs.chmodSync(CONFIG_FILE, 0o600);
}

export function loadHistory(): PushRecord[] {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
  return JSON.parse(raw) as PushRecord[];
}

export function addHistoryRecord(record: PushRecord): void {
  ensureConfigDir();
  const history = loadHistory();
  history.push(record);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export function findExistingPush(contentHash: string): PushRecord | null {
  const history = loadHistory();
  return history.find((r) => r.contentHash === contentHash) ?? null;
}
