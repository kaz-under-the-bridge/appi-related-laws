#!/usr/bin/env tsx

import * as fs from "fs/promises";
import * as path from "path";
import { parseUrlList } from "./parsers.js";
import { downloadContent, extractContent } from "./extractors.js";
import {
  generateSlug,
  normalizeUrl,
  calculateHash,
  ensureDir,
  generateUniqueSlug,
} from "./utils.js";
import { IngestedDocument, UrlListEntry } from "./types.js";

const PROJECT_ROOT = process.cwd();
const DOCS_DIR = path.join(PROJECT_ROOT, "docs");
const SOURCES_DIR = path.join(PROJECT_ROOT, "sources");
const INGESTED_DIR = path.join(PROJECT_ROOT, "ingested");

/**
 * 単一URLを処理
 */
async function processUrl(entry: UrlListEntry): Promise<void> {
  console.log(`\n処理中: ${entry.title}`);

  // URLが存在しない場合はスキップ
  if (!entry.url) {
    console.log(`⚠️  スキップ: ${entry.title}`);

    const directoryName =
      entry.directoryName || generateSlug(entry.title).substring(0, 20);
    const ingestedDir = path.join(INGESTED_DIR, directoryName);
    await ensureDir(ingestedDir);

    const skipDocument: IngestedDocument = {
      slug: directoryName,
      source_info: {
        url: "",
        title: entry.title,
        retrieved_at: new Date().toISOString(),
      },
      extraction_meta: {
        success: false,
        method: "text",
        skipped_reason: "スキップ指定またはURL未指定",
      },
      content: {
        full_text: "",
        text: "",
      },
    };

    await fs.writeFile(
      path.join(ingestedDir, `data.json`),
      JSON.stringify(skipDocument, null, 2)
    );
    return;
  }

  // URL正規化
  const normalizedUrl = normalizeUrl(entry.url);
  if (!normalizedUrl) {
    console.log(`❌ URL正規化失敗: ${entry.url}`);
    return;
  }

  // ディレクトリベースの管理
  const directoryName =
    entry.directoryName || generateSlug(entry.title).substring(0, 20);
  const sourceDir = path.join(SOURCES_DIR, directoryName);
  const ingestedDir = path.join(INGESTED_DIR, directoryName);

  await ensureDir(sourceDir);
  await ensureDir(ingestedDir);

  try {
    // ダウンロード（処理方法を考慮）
    console.log(`📥 ダウンロード中: ${normalizedUrl}`);
    let downloadResult;

    if (entry.processingMethod === "egov-api") {
      console.log(`🔄 e-Gov API処理指定`);
      downloadResult = await downloadContent(normalizedUrl);
    } else {
      downloadResult = await downloadContent(normalizedUrl);
    }

    // ファイル保存（固定ファイル名で上書き）
    const fileExtension = downloadResult.contentType.includes("pdf")
      ? "pdf"
      : downloadResult.contentType.includes("html")
      ? "html"
      : downloadResult.contentType.includes("xml")
      ? "xml"
      : "txt";
    const sourceFilePath = path.join(sourceDir, `content.${fileExtension}`);

    await fs.writeFile(sourceFilePath, downloadResult.buffer);
    console.log(`💾 保存完了: ${sourceFilePath}`);

    // sources/{slug}.md にメタデータ作成
    const sourceMd = `---
title: "${entry.title}"
url: "${normalizedUrl}"
retrieved_at: "${new Date().toISOString()}"
content_type: "${downloadResult.contentType}"
file_size: ${downloadResult.fileSize}
checksum: "${calculateHash(downloadResult.buffer)}"
etag: "${downloadResult.etag || ""}"
last_modified: "${downloadResult.lastModified || ""}"
---

# ${entry.title}

**出典**: [${normalizedUrl}](${normalizedUrl})
**取得日時**: ${new Date().toLocaleString("ja-JP")}
**ファイルサイズ**: ${(downloadResult.fileSize / 1024).toFixed(1)} KB
**コンテンツタイプ**: ${downloadResult.contentType}

## 概要
${entry.title}の一次資料です。

## ファイル情報
- 保存パス: \`${sourceFilePath}\`
- チェックサム: \`${calculateHash(downloadResult.buffer)}\`
`;

    await fs.writeFile(path.join(sourceDir, `metadata.md`), sourceMd);

    // テキスト抽出
    console.log(`📝 テキスト抽出中...`);
    const extractionResult = await extractContent(
      downloadResult.buffer,
      downloadResult.contentType
    );

    // ingested/{directoryName}/data.json 作成
    const ingestedDocument: IngestedDocument = {
      slug: directoryName,
      source_info: {
        url: normalizedUrl,
        title: entry.title,
        retrieved_at: new Date().toISOString(),
        etag: downloadResult.etag,
        last_modified: downloadResult.lastModified,
        content_type: downloadResult.contentType,
        file_size: downloadResult.fileSize,
        checksum: calculateHash(downloadResult.buffer),
      },
      extraction_meta: {
        success: extractionResult.success,
        method: extractionResult.method,
        total_pages: extractionResult.total_pages,
        extracted_pages: extractionResult.extracted_pages,
        failed_pages: extractionResult.failed_pages,
        warnings: extractionResult.warnings,
        error_message: extractionResult.error_message,
      },
      content: extractionResult.content,
    };

    await fs.writeFile(
      path.join(ingestedDir, `data.json`),
      JSON.stringify(ingestedDocument, null, 2)
    );

    if (extractionResult.success) {
      const textLength =
        extractionResult.content.full_text?.length ||
        extractionResult.content.text?.length ||
        0;
      console.log(`✅ 完了: ${directoryName} (${textLength}文字)`);

      if (extractionResult.warnings.length > 0) {
        console.log(`⚠️  警告: ${extractionResult.warnings.join(", ")}`);
      }
    } else {
      console.log(`❌ 抽出失敗: ${extractionResult.error_message}`);
    }
  } catch (error) {
    console.error(`❌ エラー (${entry.title}):`, error);

    // エラーログを ingested に保存
    const errorDocument: IngestedDocument = {
      slug: directoryName,
      source_info: {
        url: normalizedUrl,
        title: entry.title,
        retrieved_at: new Date().toISOString(),
      },
      extraction_meta: {
        success: false,
        method: "text",
        error_message: error instanceof Error ? error.message : "Unknown error",
      },
      content: {
        full_text: "",
        text: "",
      },
    };

    await fs.writeFile(
      path.join(ingestedDir, `data.json`),
      JSON.stringify(errorDocument, null, 2)
    );
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log("🚀 APPI関連法令 取得開始");

  // ディレクトリ確認・作成
  await ensureDir(SOURCES_DIR);
  await ensureDir(INGESTED_DIR);

  // コマンドライン引数からファイルパスを取得
  const args = process.argv.slice(2);
  const urlListFile = args[0] || "url_list.md";
  const urlListPath = path.isAbsolute(urlListFile)
    ? urlListFile
    : urlListFile.startsWith("docs/")
    ? urlListFile
    : path.join(DOCS_DIR, path.basename(urlListFile));

  console.log(`📋 URL一覧読み込み: ${urlListPath}`);

  const entries = await parseUrlList(urlListPath);
  console.log(`📊 対象件数: ${entries.length}件`);

  // 各URLを処理
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    console.log(`\n[${i + 1}/${entries.length}]`);

    await processUrl(entry);

    // 短い間隔を空ける（サーバー負荷軽減）
    if (i < entries.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n🎉 取得完了");

  // 結果サマリー
  const ingestedFiles = await fs.readdir(INGESTED_DIR);
  const successCount = ingestedFiles.length;

  console.log(`\n📈 結果サマリー:`);
  console.log(`- 対象件数: ${entries.length}`);
  console.log(`- 処理済み: ${successCount}`);
  console.log(
    `- sources/ に保存されたファイル数: ${
      (await fs.readdir(SOURCES_DIR)).length
    }`
  );
  console.log(`- ingested/ に保存されたファイル数: ${ingestedFiles.length}`);
}

// 実行
if (require.main === module) {
  main().catch(console.error);
}
