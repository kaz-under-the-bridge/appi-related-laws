---
doc_type: points
title: "重要ポイント（監査・実装用）— 不正アクセス禁止法"
title_en: "Actionable Points — Unauthorized Computer Access Act"
source_url: ["https://elaws.e-gov.go.jp/document?lawid=411AC0000000128"]
source_org: ["e-Gov"]
source_type: "law"
source_version: "平成11年法律第128号（現行）"
source_date: "1999-08-13"
retrieved_at: "2025-09-24"
lang: "ja"
tags: ["不正アクセス", "識別符号", "なりすまし", "罰則"]
confidence: 0.8
---

- If: ID/パスワードを配布・管理 → Then: アカウント共有を禁止、定期変更/失効、MFA 導入 [Ref: 不正アクセス]
- If: 認証失敗や異常検知 → Then: ロック/通報/調査フローを実装 [Ref: 防止]
- If: 資格情報の詐取が疑われる → Then: 速やかに失効・通知・警察等と連携 [Ref: 通報]
- If: 識別符号を取得・提供・保管 → Then: 業務上の適法範囲を超えないよう手順化 [Ref: 識別符号]
- If: 外部接続を提供 → Then: アクセス制御機能の強化（FW/WAF/レート制限） [Ref: アクセス制御]
