import { loadConfig, saveConfig, getConfigPath } from "../config";
import type { ConfigCommandArgs, CodeDistillConfig } from "../types";

const SECRET_KEYS = ["githubToken"];

export async function handleConfig({ key, value, list }: ConfigCommandArgs): Promise<void> {
  const config = loadConfig();

  if (list || (!key && !value)) {
    if (!config) {
      console.log("No configuration found. Run: cdst init");
      return;
    }
    console.log(`Config file: ${getConfigPath()}\n`);
    for (const [k, v] of Object.entries(config)) {
      const masked = SECRET_KEYS.includes(k)
        ? "****" + String(v).slice(-4)
        : v;
      console.log(`  ${k}: ${masked}`);
    }
    return;
  }

  if (key && value) {
    if (!config) {
      console.error("No configuration found. Run: cdst init");
      process.exit(1);
    }
    if (!(key in config)) {
      console.error(`Unknown config key: ${key}`);
      process.exit(1);
    }
    (config as unknown as Record<string, string>)[key] = value;
    saveConfig(config);
    console.log(`Updated ${key}.`);
    return;
  }

  if (key && !value) {
    if (!config) {
      console.error("No configuration found. Run: cdst init");
      process.exit(1);
    }
    const val = (config as unknown as Record<string, string>)[key];
    if (val === undefined) {
      console.error(`Unknown config key: ${key}`);
      process.exit(1);
    }
    const masked = SECRET_KEYS.includes(key) ? "****" + val.slice(-4) : val;
    console.log(masked);
  }
}
