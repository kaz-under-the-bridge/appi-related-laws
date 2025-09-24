# 開発ガイド（Devcontainer / アプリ開発ルール）

本ドキュメントは、開発環境やアプリ開発の運用ルールを集約した参照用ドキュメントです。日常の生成タスク（ingest → summarize → points → consulting）は .cursor/rules に記載のルールを常時適用し、本ドキュメントは必要時に参照してください。

## Devcontainer / ローカル環境

- 推奨: Devcontainer（VS Code / Docker）
- ベース: Microsoft 公式 TypeScript/Node イメージ
- 起動: 「Dev Containers: Reopen in Container」
- 自動実行: npm install / build（postCreateCommand/README 参照）

### 推奨拡張機能

- TypeScript、ESLint、Prettier、Markdown、PDF

### 統一設定（例）

- editor.formatOnSave: true
- defaultFormatter: Prettier
- typescript.preferences.importModuleSpecifier: relative

## 技術スタック

- Node.js 20+ / TypeScript 5+
- ES Modules / Strict TypeScript
- axios（HTTP） / cheerio（HTML） / pdf-parse（PDF） / zod（スキーマ）

## 開発ツール・規約

- tsx（TS 実行） / ESLint / Jest
- コードスタイル: Prettier + ESLint
- コミット規約（Conventional Commits 拡張）
  - feat(law): add PPC guideline on cookies (YYYY-MM-DD)
  - chore(ingest): ocr fix for pX of {slug}
  - docs(points): update cross-border checklist
  - change(log): add 2025-09-23 PPC notice

## 初期化タスク

- schemas/ 雛形作成
- README 整備
- indices/glossary.md 作成
- newswatch/targets.md に監視対象を列挙

## セキュリティ・コンプライアンス（開発観点）

- robots.txt 遵守、レート制限、タイムアウト、課金コンテンツ除外
- ローカル保存/機密除外/アクセスログ

## 運用補足

- 定期実行（週次新着・月次再取得・四半期レビュー）
- CI/CD・通知・外部連携は任意（必要に応じて拡張）
