import { handleInit } from "./commands/init";
import { handlePreview } from "./commands/preview";
import { handlePush } from "./commands/push";
import { handleConfig } from "./commands/config";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "init":
      await handleInit();
      break;

    case "preview":
      await handlePreview({
        filePaths: extractFilePaths(args.slice(1)),
        outputFormat: args.includes("--md") ? "markdown" : "terminal",
      });
      break;

    case "push":
      await handlePush({
        filePaths: extractFilePaths(args.slice(1)),
        targetPath: extractFlag(args, "--path"),
        message: extractFlag(args, "--message") ?? extractFlag(args, "-m"),
        force: args.includes("--force"),
      });
      break;

    case "config":
      await handleConfig({
        key: args[1]?.startsWith("-") ? undefined : args[1],
        value: args[2]?.startsWith("-") ? undefined : args[2],
        list: args.includes("--list"),
      });
      break;

    default:
      printUsage();
      process.exit(command ? 1 : 0);
  }
}

function extractFilePaths(args: string[]): string[] {
  return args.filter((a) => !a.startsWith("-"));
}

function extractFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

function printUsage(): void {
  console.log(`codedistill (cdst) - Distill generic patterns from work code

Usage:
  cdst init                          Setup GitHub token and target repo
  cdst preview <file> [--md]         Preview generalized code
  cdst push <file> [options]         Generalize and push to GitHub
  cdst config [--list] [key] [value] View or update configuration

Push options:
  --path <dir>    Override target path in repo
  -m <message>    Custom commit message
  --force         Overwrite existing file or re-push`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : "An unknown error occurred.");
  process.exit(1);
});
