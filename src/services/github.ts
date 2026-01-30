import { Octokit } from "@octokit/rest";
import type { CodeDistillConfig, GitHubPushResult, GitHubFileCheck } from "../types";

function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

function parseRepo(repo: string): { owner: string; repo: string } {
  const [owner, name] = repo.split("/");
  return { owner, repo: name };
}

export async function verifyGitHubAccess(
  token: string,
  repo: string
): Promise<void> {
  const octokit = getOctokit(token);
  const { owner, repo: repoName } = parseRepo(repo);
  await octokit.repos.get({ owner, repo: repoName });
}

export async function checkFileExists(
  config: CodeDistillConfig,
  filePath: string
): Promise<GitHubFileCheck> {
  const octokit = getOctokit(config.githubToken);
  const { owner, repo } = parseRepo(config.githubRepo);

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: config.defaultBranch,
    });

    if (!Array.isArray(data) && data.type === "file") {
      return {
        exists: true,
        sha: data.sha,
        content: Buffer.from(data.content, "base64").toString("utf-8"),
      };
    }
    return { exists: false };
  } catch (err: unknown) {
    if (err instanceof Error && "status" in err && (err as any).status === 404) {
      return { exists: false };
    }
    throw err;
  }
}

export async function pushFile(
  config: CodeDistillConfig,
  params: {
    path: string;
    content: string;
    message: string;
    existingSha?: string;
  }
): Promise<GitHubPushResult> {
  const octokit = getOctokit(config.githubToken);
  const { owner, repo } = parseRepo(config.githubRepo);

  const { data } = await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: params.path,
    message: params.message,
    content: Buffer.from(params.content).toString("base64"),
    branch: config.defaultBranch,
    sha: params.existingSha,
  });

  return {
    commitSha: data.commit.sha!,
    fileUrl: data.content?.html_url ?? "",
    commitUrl: data.commit.html_url ?? "",
  };
}
