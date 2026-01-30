import * as fs from "node:fs";
import * as path from "node:path";

const LANGUAGE_MAP: Record<string, string> = {
  ".ts": "typescript",
  ".tsx": "typescript",
  ".js": "javascript",
  ".jsx": "javascript",
  ".py": "python",
  ".go": "go",
  ".rs": "rust",
  ".java": "java",
  ".rb": "ruby",
  ".swift": "swift",
  ".kt": "kotlin",
  ".cs": "csharp",
  ".cpp": "cpp",
  ".c": "c",
  ".sh": "bash",
  ".sql": "sql",
  ".yaml": "yaml",
  ".yml": "yaml",
  ".vue": "vue",
};

const MAX_FILE_SIZE = 100 * 1024;

export function readSourceFile(absolutePath: string): string {
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  const stats = fs.statSync(absolutePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${Math.round(stats.size / 1024)}KB). Max: ${MAX_FILE_SIZE / 1024}KB.`
    );
  }

  return fs.readFileSync(absolutePath, "utf-8");
}

export function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return LANGUAGE_MAP[ext] ?? "plaintext";
}
