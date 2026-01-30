# codedistill (cdst)

業務コードから汎用的なパターンを抽出し、個人GitHubにpushするCLIツール。

業務コードには社名・ビジネスロジック・クレデンシャルが含まれますが、その裏にあるプログラミングパターンはあなた自身のスキルです。`cdst` は Claude Code を使ってコードを汎用化し、ワンコマンドで個人リポジトリにpushします。

## 仕組み

```
cdst push src/services/acme-payment-api.ts
```

1. ソースファイルを読み込み
2. Claude Code がコードを汎用化（社名・クレデンシャル・業務ロジックを除去）
3. 汎用化結果をプレビュー表示
4. Contents API 経由で個人GitHubリポジトリにpush

**Before（業務コード）:**
```typescript
import { AcmeAuthClient } from "../auth/acme-auth";

export async function callPaymentAPI(orderId: string, amount: number) {
  const auth = new AcmeAuthClient(process.env.ACME_SECRET_KEY!);
  // ... 会社固有の実装
}
```

**After（汎用化後）:**
```typescript
/**
 * Fetch wrapper with retry and exponential backoff.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { maxRetries?: number }
): Promise<Response> {
  // ... 汎用的なパターン
}
```

## 前提条件

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) がインストール・認証済みであること
- [GitHub Personal Access Token](https://github.com/settings/tokens)（`repo` スコープ）
- Node.js 20+

## セットアップ

```bash
# インストール
pnpm install
pnpm build
pnpm link --global

# 初期設定
cdst init
```

## 使い方

```bash
# 汎用化結果をプレビュー（pushしない）
cdst preview <file>

# 汎用化して個人リポジトリにpush
cdst push <file>

# カスタムコミットメッセージを指定
cdst push <file> -m "Add retry utility"

# リポジトリ内の保存先パスを指定
cdst push <file> --path "libraries/http"

# 既にpush済みのファイルを再push
cdst push <file> --force

# 設定を表示
cdst config --list

# 設定値を変更
cdst config defaultTargetPath libraries
```

## 設定

`~/.codedistill/config.json` に保存:

| キー | 説明 | デフォルト |
|------|------|-----------|
| `githubToken` | GitHub Personal Access Token | — |
| `githubRepo` | 対象リポジトリ（`owner/repo`） | — |
| `defaultBranch` | pushするブランチ | `main` |
| `defaultTargetPath` | リポジトリ内のベースパス | `snippets` |

## 個人リポジトリの構成

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

カテゴリはAIが提案: `patterns`, `utils`, `data-structures`, `algorithms`, `api-integration`, `middleware`, `hooks`, `components`, `testing`, `config`, `other`

## ライセンス

MIT
