import chalk from "chalk";
import type { GeneralizationResult } from "../types";

export function formatPreview(
  result: GeneralizationResult,
  format: "terminal" | "markdown"
): void {
  if (format === "markdown") {
    console.log(`## ${result.suggestedFilename}\n`);
    console.log(`**Category:** ${result.suggestedCategory}`);
    console.log(`**Description:** ${result.description}\n`);
    console.log(`\`\`\`${result.language}`);
    console.log(result.generalizedCode);
    console.log("```\n");
    return;
  }

  console.log(chalk.bold.cyan(`\n--- ${result.suggestedFilename} ---`));
  console.log(chalk.dim(`Category: ${result.suggestedCategory}`));
  console.log(chalk.dim(`Description: ${result.description}`));
  console.log(chalk.dim(`Original: ${result.originalPath}\n`));
  console.log(result.generalizedCode);
  console.log(chalk.dim("\n--- end ---"));
}
