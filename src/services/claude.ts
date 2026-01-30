import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { GeneralizationRequest, GeneralizationResult } from "../types";

const SYSTEM_PROMPT = `You are a code generalization expert. Transform the given source code into a generic, reusable version that demonstrates the same programming pattern without revealing anything about the original company, product, or business domain.

Rules:
1. REMOVE all company-specific names, product names, internal service names, and domain-specific terminology.
2. REMOVE all credentials, API keys, internal URLs, IP addresses, email addresses, and employee names.
3. REMOVE all comments referencing internal systems, tickets, or proprietary processes.
4. REPLACE business-specific names with generic equivalents that describe the programming concept.
5. REPLACE domain-specific types with generic alternatives.
6. PRESERVE the programming pattern, algorithm, architecture, and code structure.
7. PRESERVE import/export patterns but generalize internal module names.
8. ADD a brief header comment describing what pattern or technique the code demonstrates.
9. Ensure the generalized code is syntactically valid.

You MUST respond with ONLY a JSON object (no markdown fences, no extra text) matching this exact structure:
{
  "generalizedCode": "the fully generalized source code as a string",
  "suggestedFilename": "descriptive-kebab-case-filename.ext",
  "suggestedCategory": "one of: patterns | utils | data-structures | algorithms | api-integration | middleware | hooks | components | testing | config | other",
  "description": "one-line description of the pattern (for commit message)",
  "warnings": ["array of warnings about content that may still be specific"]
}`;

export async function generalizeCode(
  request: GeneralizationRequest
): Promise<GeneralizationResult> {
  const userPrompt = `Generalize the following ${request.language} code:\n\n${request.sourceCode}`;

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

  // Write prompt to temp file to avoid shell escaping issues
  const tmpFile = path.join(os.tmpdir(), `cdst-prompt-${Date.now()}.txt`);
  fs.writeFileSync(tmpFile, fullPrompt);

  try {
    const result = execSync(`claude -p < "${tmpFile}"`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
      timeout: 120_000,
    });

    const parsed = JSON.parse(extractJson(result));

    return {
      originalPath: request.filePath,
      language: request.language,
      generalizedCode: parsed.generalizedCode,
      suggestedFilename: parsed.suggestedFilename,
      suggestedCategory: parsed.suggestedCategory,
      description: parsed.description,
      warnings: parsed.warnings ?? [],
    };
  } finally {
    fs.unlinkSync(tmpFile);
  }
}

function extractJson(text: string): string {
  // Try parsing the whole text first
  const trimmed = text.trim();
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    // look for JSON block in markdown fences
  }

  // Extract from ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try to find JSON object boundaries
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  throw new Error("Failed to extract JSON from Claude response");
}
