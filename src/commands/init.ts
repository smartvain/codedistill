import inquirer from "inquirer";
import { saveConfig, ensureConfigDir, loadConfig } from "../config";
import { verifyGitHubAccess } from "../services/github";
import type { CodeDistillConfig } from "../types";

export async function handleInit(): Promise<void> {
  ensureConfigDir();
  const existing = loadConfig();

  console.log("codedistill setup\n");

  if (existing) {
    console.log("Existing configuration found. Values will be used as defaults.\n");
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "githubToken",
      message: "GitHub personal access token:",
      default: existing?.githubToken,
      validate: (input: string) =>
        input.length > 0 || "Token is required",
    },
    {
      type: "input",
      name: "githubRepo",
      message: "Target GitHub repo (owner/repo):",
      default: existing?.githubRepo,
      validate: (input: string) =>
        /^[\w.-]+\/[\w.-]+$/.test(input) || "Must be in owner/repo format",
    },
    {
      type: "input",
      name: "defaultBranch",
      message: "Default branch:",
      default: existing?.defaultBranch ?? "main",
    },
    {
      type: "input",
      name: "defaultTargetPath",
      message: "Default target path in repo:",
      default: existing?.defaultTargetPath ?? "snippets",
    },
  ]);

  const config: CodeDistillConfig = {
    githubToken: answers.githubToken,
    githubRepo: answers.githubRepo,
    defaultBranch: answers.defaultBranch,
    defaultTargetPath: answers.defaultTargetPath,
  };

  console.log("\nVerifying GitHub access...");
  try {
    await verifyGitHubAccess(config.githubToken, config.githubRepo);
    console.log("OK");
  } catch {
    console.error("Failed to access repository. Check your token and repo name.");
    process.exit(1);
  }

  saveConfig(config);
  console.log("\nSetup complete. You're ready to use cdst!");
}
