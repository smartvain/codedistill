import * as path from "node:path";
import * as crypto from "node:crypto";
import inquirer from "inquirer";
import { loadConfig, findExistingPush, addHistoryRecord } from "../config";
import { readSourceFile, detectLanguage } from "../services/file-reader";
import { generalizeCode } from "../services/claude";
import { checkFileExists, pushFile } from "../services/github";
import { formatPreview } from "../utils/logger";
import type { PushCommandArgs } from "../types";

export async function handlePush({
  filePaths,
  targetPath,
  message,
  force,
}: PushCommandArgs): Promise<void> {
  const config = loadConfig();
  if (!config) {
    console.error("Not configured. Run: cdst init");
    process.exit(1);
  }

  if (filePaths.length === 0) {
    console.error("Usage: cdst push <file> [--path <target>] [-m <message>] [--force]");
    process.exit(1);
  }

  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);
    const sourceCode = readSourceFile(absolutePath);
    const language = detectLanguage(absolutePath);
    const contentHash = crypto.createHash("sha256").update(sourceCode).digest("hex");

    const existingPush = findExistingPush(contentHash);
    if (existingPush && !force) {
      console.log(
        `This file was already pushed to ${existingPush.targetPath} on ${existingPush.pushedAt}.`
      );
      console.log("Use --force to push again.");
      continue;
    }

    console.log(`Generalizing: ${filePath}`);
    const result = await generalizeCode({ sourceCode, filePath: absolutePath, language });

    formatPreview(result, "terminal");

    const finalTargetPath = [
      targetPath ?? config.defaultTargetPath,
      result.suggestedCategory,
      result.suggestedFilename,
    ].join("/");

    console.log(`\nTarget: ${config.githubRepo}/${finalTargetPath}`);

    const existing = await checkFileExists(config, finalTargetPath);
    if (existing.exists && !force) {
      console.log("File already exists in repo. Use --force to overwrite.");
      continue;
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "confirmed",
        message: "Push this generalized code?",
        default: true,
      },
    ]);

    if (!confirmed) {
      console.log("Skipped.");
      continue;
    }

    const commitMessage = message ?? `Add ${result.suggestedFilename}: ${result.description}`;
    const pushResult = await pushFile(config, {
      path: finalTargetPath,
      content: result.generalizedCode,
      message: commitMessage,
      existingSha: existing.sha,
    });

    addHistoryRecord({
      originalPath: absolutePath,
      targetPath: finalTargetPath,
      commitSha: pushResult.commitSha,
      pushedAt: new Date().toISOString(),
      contentHash,
    });

    console.log(`\nPushed! ${pushResult.fileUrl}`);
  }
}
