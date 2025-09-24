import * as fs from "fs/promises";
import { UrlListEntry } from "./types.js";

/**
 * docs/url_list.md を解析してURL一覧を取得
 */
export async function parseUrlList(filePath: string): Promise<UrlListEntry[]> {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");

  const entries: UrlListEntry[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // テーブルヘッダーをスキップ（複数形式に対応）
    if (
      trimmed.startsWith("| KB Status") ||
      trimmed.startsWith("| 項目") ||
      trimmed.startsWith("|---") ||
      trimmed.startsWith("|| 項目")
    ) {
      inTable = true;
      continue;
    }

    // テーブル行の解析（二重パイプ対応）
    if (
      inTable &&
      (trimmed.startsWith("|") || trimmed.startsWith("||")) &&
      trimmed.endsWith("|")
    ) {
      const parts = trimmed
        .replace(/^\|+/, "")
        .replace(/\|+$/, "")
        .split("|")
        .map((p) => p.trim())
        .filter((p) => p);

      if (parts.length >= 2) {
        const kbStatus = parts[0];
        const title = parts[1];
        const urlPart = parts[2];
        const processingMethod = parts.length >= 4 ? parts[3] : "auto";
        const directoryName = parts.length >= 5 ? parts[4] : "";
        const note = parts.length >= 6 ? parts[5] : "";

        // KB Statusが✅の場合は取得済みとしてスキップ
        if (kbStatus === "✅") {
          console.log(`⏭️  取得済みスキップ: ${title}`);
          continue;
        }

        // URLが存在するかチェック
        let url: string | undefined;
        if (urlPart && urlPart.startsWith("http")) {
          // ※印などの注釈を除去
          url = urlPart.split(" ")[0];
        }

        // 処理方法がskipの場合はクロール対象外
        if (processingMethod === "skip") {
          url = undefined;
        }

        if (
          title &&
          title !== "項目" &&
          !title.includes("---") &&
          title !== "処理方法" &&
          title !== "ディレクトリ名" &&
          kbStatus !== "KB Status"
        ) {
          // ディレクトリ名が指定されていない場合はタイトルからslugを生成
          const finalDirectoryName =
            directoryName ||
            title
              .replace(/[０-９]/g, (s) =>
                String.fromCharCode(s.charCodeAt(0) - 0xfee0)
              )
              .replace(/[Ａ-Ｚａ-ｚ]/g, (s) =>
                String.fromCharCode(s.charCodeAt(0) - 0xfee0)
              )
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "")
              .substring(0, 20);

          entries.push({
            title,
            url,
            directoryName: finalDirectoryName,
            processingMethod: processingMethod as
              | "auto"
              | "egov-api"
              | "skip"
              | undefined,
          });
        }
      }
    }

    // 空行でテーブル終了とみなす
    if (inTable && !trimmed) {
      break;
    }
  }

  return entries;
}
