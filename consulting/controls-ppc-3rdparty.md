---
doc_type: consulting
title: "コンサル助言（Controls）- 第三者提供（確認・記録義務）"
title_en: "Consulting Controls - Third-Party Provision (Confirmation and Records)"
source_url: ["https://www.ppc.go.jp/personalinfo/legal/guidelines_tsusoku/"]
source_org: ["個人情報保護委員会"]
source_type: "guideline"
source_version: "最新版（Web公表）"
source_date: "不明"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["第三者提供", "記録義務", "確認義務", "オプトアウト", "共同利用の区別"]
confidence: 0.85
---

| Control                          | Why (Risk)           | How (Measure)                                | Evidence/Log             | Owner         | Priority | Ref          |
| -------------------------------- | -------------------- | -------------------------------------------- | ------------------------ | ------------- | -------- | ------------ |
| 第三者提供台帳の整備             | トレーサビリティ欠如 | 提供日/先/項目/手段/根拠を記録、保存期限管理 | 提供記録、改ざん防止ログ | 情報管理/法務 | High     | 記録義務     |
| 受領時の取得経緯確認             | 不適法な受領         | 同意/オプトアウト/例外の確認、結果の記録     | 受領確認票、証跡ログ     | 事業/法務     | High     | 確認義務     |
| オプトアウト提供の適法性確認     | 違法提供             | 公表事項・届出・除外項目のチェックリスト運用 | 公表ページ、届出控       | 法務/広報     | High     | オプトアウト |
| 共同利用/委託/承継の判定プロセス | 区別誤り             | 判定基準と承認フロー、誤用防止教育           | 判定記録、承認履歴       | 法務          | High     | 区別         |
| 第三者提供記録の開示対応         | 権利侵害リスク       | 電磁的開示の SOP・SLA、本人確認手順          | 開示台帳、応答ログ       | CS/法務       | Medium   | 権利行使     |
| 監査証跡の完全性確保             | 証跡欠落             | ログの改ざん防止・バックアップ、定期監査     | 監査報告、ハッシュ       | セキュリティ  | Medium   | 記録管理     |

> 備考: API/S2S 連携は自動ログ連携を推奨。共同利用の公表は責任者・範囲・取得方法を常時最新化。
