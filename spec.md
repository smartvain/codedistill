# codedistill (cdst) - 仕様書

業務コードをAIで汎用化し、個人GitHubにワンコマンドでpushするCLIツール。
プロジェクト名: `codedistill`、CLIコマンド名: `cdst`

## フロー

```
cdst push src/utils/retry.ts
  → ファイル読み込み
  → claude -p でコードを汎用化（API Key不要、Claude Code Maxを利用）
  → プレビュー表示
  → ユーザー確認
  → GitHub Contents API で個人リポジトリにコミット
```

## プロジェクト構成

```
codedistill/
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── cli.ts                  # エントリポイント（手動パーサー、switch文）
│   ├── types.ts                # 全インターフェース定義
│   ├── config.ts               # ~/.codedistill/config.json の読み書き
│   ├── commands/
│   │   ├── init.ts             # セットアップウィザード（inquirer）
│   │   ├── preview.ts          # 汎用化プレビュー表示
│   │   ├── push.ts             # 汎用化 → GitHub push
│   │   └── config.ts           # 設定の表示・変更
│   ├── services/
│   │   ├── claude.ts           # claude -p 呼び出しによるAI汎用化
│   │   ├── github.ts           # Octokit経由でGitHub Contents API操作
│   │   └── file-reader.ts      # ファイル読み込み・言語検出
│   └── utils/
│       └── logger.ts           # chalk によるカラー出力
```

## CLI コマンド

```bash
cdst init                          # セットアップ（GitHub PATとリポジトリの設定のみ）
cdst preview <file> [--md]         # 汎用化をプレビュー
cdst push <file> [--path <dir>] [-m <msg>] [--force]  # 汎用化してpush
cdst config [--list] [key] [value] # 設定の表示・変更
```

## 技術スタック

- TypeScript 5.7 + strict mode, ES2022, commonjs
- pnpm
- esbuild（`dist/cli.js` にバンドル、`#!/usr/bin/env node` バナー付き）
- tsx（ローカル開発用）
- 依存: `@octokit/rest`, `chalk@4`（CJS互換）, `inquirer@8`（CJS互換）
- AI: `claude -p` コマンド経由（OpenAI/Anthropic SDK不要、API Key不要）

## AI汎用化の仕組み

`claude -p` (Claude Code のプロンプトモード) を `child_process.execSync` で呼び出す。

```typescript
// services/claude.ts のイメージ
import { execSync } from "node:child_process";

const prompt = `以下のコードを汎用化してください。...
必ず以下のJSON形式で返してください:
{ "generalizedCode": "...", "suggestedFilename": "...", ... }`;

const result = execSync(`claude -p '${escapedPrompt}'`, { encoding: "utf-8" });
const parsed = JSON.parse(extractJson(result));
```

プロンプトで以下を指示:
1. 社名・プロダクト名・内部サービス名・ドメイン用語を除去
2. クレデンシャル・内部URL・JIRA IDなどを除去
3. 変数名・関数名・クラス名を汎用的な名前に変換
4. プログラミングパターン・アーキテクチャ・構造は保持
5. 汎用化が困難な箇所は warnings で報告

AIレスポンス（JSON）:
- `generalizedCode` - 汎用化されたコード
- `suggestedFilename` - ファイル名（kebab-case）
- `suggestedCategory` - カテゴリ（patterns, utils, hooks 等）
- `description` - コミットメッセージ用の1行説明
- `warnings` - 注意事項リスト

## 設定管理

`~/.codedistill/config.json` に保存（chmod 600）:
- `githubToken` - GitHub PAT
- `githubRepo` - `owner/repo` 形式
- `defaultBranch` - デフォルト `main`
- `defaultTargetPath` - デフォルト `snippets`

※ OpenAI API Key やモデル設定は不要（Claude Code Maxを使用）

`~/.codedistill/history.json` でpush済みファイルを追跡（SHA-256ハッシュで重複検出）。

## GitHub連携

Octokit REST API（Contents API）を使用。ローカルにclone不要。
- `checkFileExists()` → 既存ファイル確認
- `pushFile()` → createOrUpdateFileContents でコミット

個人リポジトリ内の構成:
```
snippets/
  patterns/     # デザインパターン
  utils/        # ユーティリティ
  hooks/        # React hooks等
  middleware/   # ミドルウェア
  api-integration/  # API連携パターン
  ...
```

## 検証方法

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm build` でesbuildバンドルが成功することを確認
3. `cdst init` でセットアップが完了すること
4. `cdst preview <テストファイル>` で汎用化結果が表示されること
5. `cdst push <テストファイル>` で個人リポジトリにコミットされること
