---
doc_type: points
title: "コンピュータウイルス対策基準（実装チェックポイント）"
title_en: "Computer Virus Countermeasures - Actionable Points"
source_url: ["http://www.meti.go.jp/policy/netsecurity/CvirusCMG.htm"]
source_org: ["経済産業省"]
source_type: "guideline"
source_version: "不明"
source_date: "不明"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["ウイルス", "マルウェア", "運用", "監査"]
confidence: 0.8
---

- If 外部メディア/ファイルを受領 Then 受入時に最新定義でフルスキャン [Ref: ユーザ基準]
- If 端末/サーバにソフト導入 Then 事前ウイルス検査と出所確認 [Ref: 管理者基準]
- If 感染疑い発生 Then 直ちに隔離・使用停止・連絡・記録 [Ref: 事後対応]
- If パスワード運用が安易 Then 強度・定期変更・共有禁止を実施 [Ref: ユーザ/管理者]
- If バックアップ体制不足 Then 取得/保管/復旧手順を整備し定期演習 [Ref: 管理者]
- If 公開前にファイル配布 Then 配布前スキャンとハッシュ提示を検討 [Ref: 事業者基準]
- If 対策の有効性不明 Then 年次監査と是正計画を実施 [Ref: 監査]
