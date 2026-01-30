import * as path from "node:path";
import { loadConfig } from "../config";
import { readSourceFile, detectLanguage } from "../services/file-reader";
import { generalizeCode } from "../services/claude";
import { formatPreview } from "../utils/logger";
import type { PreviewCommandArgs } from "../types";

export async function handlePreview({
  filePaths,
  outputFormat,
}: PreviewCommandArgs): Promise<void> {
  const config = loadConfig();
  if (!config) {
    console.error("Not configured. Run: cdst init");
    process.exit(1);
  }

  if (filePaths.length === 0) {
    console.error("Usage: cdst preview <file> [file2 ...]");
    process.exit(1);
  }

  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    const sourceCode = readSourceFile(absolutePath);
    const language = detectLanguage(absolutePath);

    console.log(`\nGeneralizing: ${filePath}`);

    const result = await generalizeCode({
      sourceCode,
      filePath: absolutePath,
      language,
    });

    formatPreview(result, outputFormat);

    if (result.warnings.length > 0) {
      console.log("\nWarnings:");
      for (const warning of result.warnings) {
        console.log(`  - ${warning}`);
      }
    }
  }
}
