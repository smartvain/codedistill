export interface CodeDistillConfig {
  githubToken: string;
  githubRepo: string;
  defaultBranch: string;
  defaultTargetPath: string;
}

export interface GeneralizationResult {
  originalPath: string;
  language: string;
  generalizedCode: string;
  suggestedFilename: string;
  suggestedCategory: string;
  description: string;
  warnings: string[];
}

export interface GeneralizationRequest {
  sourceCode: string;
  filePath: string;
  language: string;
}

export interface GitHubPushResult {
  commitSha: string;
  fileUrl: string;
  commitUrl: string;
}

export interface GitHubFileCheck {
  exists: boolean;
  sha?: string;
  content?: string;
}

export interface PushRecord {
  originalPath: string;
  targetPath: string;
  commitSha: string;
  pushedAt: string;
  contentHash: string;
}

export interface PreviewCommandArgs {
  filePaths: string[];
  outputFormat: "terminal" | "markdown";
}

export interface PushCommandArgs {
  filePaths: string[];
  targetPath?: string;
  message?: string;
  force: boolean;
}

export interface ConfigCommandArgs {
  key?: string;
  value?: string;
  list: boolean;
}
