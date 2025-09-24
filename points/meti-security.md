---
doc_type: points
title: "情報システム安全対策基準（実装チェックポイント）"
title_en: "Information System Security Standards - Actionable Points"
source_url:
  ["http://www.meti.go.jp/policy/netsecurity/downloadfiles/esecu03j.pdf"]
source_org: ["経済産業省"]
source_type: "guideline"
source_version: "不明"
source_date: "不明"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["METI", "情報セキュリティ", "運用", "監査"]
confidence: 0.75
---

- If システムの管理責任者が未指名 Then 権限・連絡体制を文書化し指名する [Ref: 本基準 管理者基準]
- If 新規機器/ソフト導入 Then 導入前ウイルス検査と構成情報の記録を行う [Ref: 管理者基準]
- If 持込メディア/外部ファイル受領 Then 利用前にウイルス検査を必須化する [Ref: ユーザ基準]
- If 匿名サービスを運用 Then 濫用防止のため提供範囲を限定しログ保全する [Ref: 管理者基準]
- If 重要情報を扱う Then アクセス権限を最小化し定期見直しを実施する [Ref: 管理者基準]
- If バックアップ運用を未整備 Then 取得頻度/保管期間/復旧テストを定義する [Ref: ユーザ・管理者基準]
- If 異常兆候を検知 Then 原因分析と再発防止策を実施し記録を残す [Ref: 管理者基準]
- If ウイルス感染発生 Then 端末隔離 → 連絡 → 復旧手順に従い証跡を保全する [Ref: ユーザ・管理者基準]
- If 年次監査未実施 Then 対策の有効性監査を計画・是正実施する [Ref: 監査]
