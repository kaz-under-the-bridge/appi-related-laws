---
doc_type: summary
title: "クラウドサービス利用のための情報セキュリティマネジメントガイドライン"
title_en: "Security Management Guideline for Cloud Service Use"
source_url:
  ["https://www.meti.go.jp/policy/netsecurity/downloadfiles/cloudsec2013fy.pdf"]
source_org: ["経済産業省"]
source_type: "guideline"
source_version: "不明"
source_date: "不明"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["クラウド", "ベンダ管理", "委託", "可用性", "SLAs"]
confidence: 0.7
---

### 概要（Overview）

事業者がクラウドサービスを安全に利用するための管理策（契約、リスク、可用性、可観測性、退出）を整理した指針。

### 目的・適用範囲（Purpose / Scope）

- 目的: クラウド利用時の情報セキュリティリスクを管理し、事業継続と法令順守を確保。
- 範囲: IaaS/PaaS/SaaS 等の外部クラウドサービスの利用全般。

### 定義（Definitions）

- 役割分担（責任共有モデル）、SLA/OLA、可用性、ログ保全等。

### 主要要件（Key Requirements）

- 事前評価: データ分類、適法性（越境移転含む）、事業継続、退出計画。
- 契約/SLA: セキュリティ要件、ログ・監査、障害/事故報告、下請管理。
- 技術対策: 暗号化、鍵管理、ID 連携、ネットワーク分離、ログ保全。
- 運用: 権限管理、変更管理、脆弱性対応、定期評価と監査。

### 実務例（Practical Examples）

- ベンダ選定チェックリスト、SLA テンプレ、エビデンス要求事項の明文化。
- 退出（データ消去・移行）の具体手順とテスト。

### 留意点（Caveats）

- サービス固有仕様の差異に留意（監査手段、可観測性、鍵管理モデル）。
- 個人情報・機微情報は契約要件と技術統制の二重で担保。

### 更新点（Updates）

- 原典版数・日付は現地確認要。最新のクラウド実務（ゼロトラスト、CSP 責任モデル更新）で補完。

出典 URL: https://www.meti.go.jp/policy/netsecurity/downloadfiles/cloudsec2013fy.pdf
