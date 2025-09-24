# Devcontainer Setup

このディレクトリには、APPI関連法令ナレッジベースの開発環境をコンテナ化するためのDevcontainer設定が含まれています。

## 🐳 構成

### ファイル構成
```
.devcontainer/
├── devcontainer.json    # VS Code Devcontainer設定
├── docker-compose.yml   # Docker Compose設定
├── Dockerfile          # カスタムイメージ定義
└── README.md           # このファイル
```

### 基本イメージ
- **ベース**: `mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm`
- **Node.js**: 20.x LTS
- **OS**: Debian Bookworm

### インストール済みツール
- **言語・ランタイム**: Node.js 20, TypeScript, tsx
- **開発ツール**: ESLint, Prettier, Git
- **システム**: poppler-utils (PDF処理), 日本語フォント
- **ユーティリティ**: curl, wget, jq, htop, tree

## 🚀 使用方法

### 1. VS Code での起動
```bash
# リポジトリクローン
git clone <repository-url>
cd appi-related-laws

# VS Code で開く
code .

# コマンドパレット (Ctrl/Cmd + Shift + P)
> Dev Containers: Reopen in Container
```

### 2. 初回セットアップ
コンテナ起動後、以下が自動実行されます：
- `npm install`: 依存関係インストール
- `npm run build`: TypeScriptビルド

### 3. 開発開始
```bash
# コンテナ内で実行
npm run ingest    # 法令データ取得
npm run dev       # 開発モード
npm run test      # テスト実行
```

## ⚙️ カスタマイズ

### VS Code 拡張機能
以下の拡張機能が自動インストールされます：
- TypeScript支援
- ESLint/Prettier
- Markdown編集支援
- PDF閲覧
- 日本語スペルチェック

### エイリアス
コンテナ内で使用可能なエイリアス：
```bash
ll          # ls -la
ingest      # npm run ingest
build       # npm run build
```

### ポート転送
- **3000**: 開発サーバー用
- **8080**: API/管理画面用

## 🔧 トラブルシューティング

### 権限エラー
```bash
# ファイル権限修正
sudo chown -R vscode:vscode /workspace
```

### Node.js依存関係エラー
```bash
# キャッシュクリア
rm -rf node_modules package-lock.json
npm install
```

### 日本語表示問題
```bash
# ロケール確認
locale
echo $LANG

# 再設定（必要に応じて）
sudo locale-gen ja_JP.UTF-8
```

## 📊 パフォーマンス最適化

### ボリュームマウント
- `sources/`, `ingested/` はバインドマウントで永続化
- `node_modules` は名前付きボリュームでパフォーマンス向上

### メモリ・CPU
推奨リソース：
- **メモリ**: 4GB以上
- **CPU**: 2コア以上
- **ディスク**: 10GB以上の空き容量

## 🔄 更新・メンテナンス

### イメージ更新
```bash
# Devcontainerリビルド
> Dev Containers: Rebuild Container

# 完全リビルド（キャッシュなし）
> Dev Containers: Rebuild Container (No Cache)
```

### 設定変更
`devcontainer.json` 編集後：
```bash
> Dev Containers: Reopen in Container
```

## 🌐 ネットワーク・セキュリティ

### 外部通信
- 官公庁サイトへのHTTPS通信のみ許可
- プロキシ設定は環境変数で対応

### データ保護
- ローカルファイルのみ（外部送信なし）
- 機密情報は環境変数管理

## 🔮 将来拡張

### 追加サービス（コメントアウト済み）
- **Elasticsearch**: 全文検索エンジン
- **Redis**: キャッシュ・セッション管理
- **PostgreSQL**: メタデータDB

### 有効化方法
`docker-compose.yml` のコメントを解除してリビルド：
```bash
> Dev Containers: Rebuild Container
```
