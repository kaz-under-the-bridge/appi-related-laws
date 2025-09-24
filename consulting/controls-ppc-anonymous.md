---
doc_type: consulting
title: "コンサル助言（Controls）- 仮名加工情報・匿名加工情報"
title_en: "Consulting Controls - Pseudonymized and Anonymized Information"
source_url: ["https://www.ppc.go.jp/personalinfo/legal/guidelines_anonymous/"]
source_org: ["個人情報保護委員会"]
source_type: "guideline"
source_version: "最新版（Web公表）"
source_date: "不明"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["仮名加工", "匿名加工", "再識別禁止", "公表", "内部統制"]
confidence: 0.85
---

| Control            | Why (Risk)     | How (Measure)                                | Evidence/Log       | Owner      | Priority | Ref        |
| ------------------ | -------------- | -------------------------------------------- | ------------------ | ---------- | -------- | ---------- |
| 仮名加工運用規程   | 再識別・目的外 | 非照合ルール、目的制限、連絡禁止、鍵管理     | 運用規程、権限台帳 | データ管理 | High     | 仮名加工   |
| アクセス分離設計   | 照合リスク     | 原データと仮名加工情報のアクセス・役割分離   | 権限設定、監査ログ | 情報シス   | High     | 仮名加工   |
| 匿名加工作成基準   | 匿名性不足     | 加工手順、品質基準、テスト（k-anonymity 等） | 手順書、検証記録   | データ管理 | High     | 匿名加工   |
| 匿名加工項目の公表 | 透明性不足     | 公表ページ、変更時の版管理                   | 公表ページ、版管理 | 法務/広報  | Medium   | 公表       |
| 提供管理（匿名）   | 誤提供         | 匿名明示、提供記録、受領条件                 | 提供台帳           | 情報管理   | Medium   | 提供       |
| 定期リスクレビュー | 形骸化         | 再識別リスク評価の年次レビュー               | 評価記録           | データ管理 | Medium   | リスク管理 |
