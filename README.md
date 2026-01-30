# codedistill (cdst)

[日本語](./README.ja.md)

Distill generic patterns from work code and push to your personal GitHub.

Work code contains company-specific naming, business logic, and credentials — but the underlying programming patterns are yours. `cdst` uses Claude Code to generalize your code and push it to a personal repository with one command.

## How it works

```
cdst push src/services/acme-payment-api.ts
```

1. Reads the source file
2. Claude Code generalizes the code (removes company names, credentials, business logic)
3. Shows you the result for review
4. Pushes to your personal GitHub repository via the Contents API

**Before (work code):**
```typescript
import { AcmeAuthClient } from "../auth/acme-auth";

export async function callPaymentAPI(orderId: string, amount: number) {
  const auth = new AcmeAuthClient(process.env.ACME_SECRET_KEY!);
  // ... company-specific implementation
}
```

**After (generalized):**
```typescript
/**
 * Fetch wrapper with retry and exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { maxRetries?: number }
): Promise<Response> {
  // ... generic pattern
}
```

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed and authenticated
- [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope
- Node.js 20+

## Setup

```bash
# Install
pnpm install
pnpm build
pnpm link --global

# Configure
cdst init
```

## Usage

```bash
# Preview generalized code without pushing
cdst preview <file>

# Generalize and push to your personal repo
cdst push <file>

# Push with custom commit message
cdst push <file> -m "Add retry utility"

# Push to a custom path in the repo
cdst push <file> --path "libraries/http"

# Re-push a previously pushed file
cdst push <file> --force

# View configuration
cdst config --list

# Update a config value
cdst config defaultTargetPath libraries
```

## Configuration

Stored at `~/.codedistill/config.json`:

| Key | Description | Default |
|-----|-------------|---------|
| `githubToken` | GitHub Personal Access Token | — |
| `githubRepo` | Target repo (`owner/repo`) | — |
| `defaultBranch` | Branch to push to | `main` |
| `defaultTargetPath` | Base path in repo | `snippets` |

## How code is organized in your repo

```
your-repo/
└── snippets/
    ├── patterns/
    │   └── retry-with-backoff.ts
    ├── utils/
    │   └── deep-merge.ts
    ├── middleware/
    │   └── jwt-auth-middleware.ts
    └── hooks/
        └── use-debounced-search.ts
```

Categories are suggested by AI: `patterns`, `utils`, `data-structures`, `algorithms`, `api-integration`, `middleware`, `hooks`, `components`, `testing`, `config`, `other`.

## License

MIT
