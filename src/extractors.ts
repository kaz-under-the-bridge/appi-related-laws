import axios from "axios";
import * as cheerio from "cheerio";
import pdfParse from "pdf-parse";
import { calculateHash } from "./utils.js";

export interface ExtractionResult {
  success: boolean;
  method: "html" | "pdf" | "text" | "ocr";
  content: {
    full_text?: string;
    html?: string;
    text?: string;
    pages?: Array<{ page_num: number; text: string }>;
    metadata?: Record<string, any>;
  };
  warnings: string[];
  error_message?: string;
  total_pages?: number;
  extracted_pages?: number;
  failed_pages?: number[];
}

export interface DownloadResult {
  buffer: Buffer;
  headers: Record<string, string>;
  contentType: string;
  fileSize: number;
  etag?: string;
  lastModified?: string;
}

/**
 * e-Gov法令IDを抽出
 */
function extractEgovLawId(url: string): string | null {
  const match = url.match(/law_unique_id=([A-Z0-9]+)|lawid=([A-Z0-9]+)/);
  return match ? match[1] || match[2] : null;
}

/**
 * URLからコンテンツをダウンロード
 */
export async function downloadContent(url: string): Promise<DownloadResult> {
  // e-Gov法令検索の場合はAPI経由で取得
  if (url.includes("elaws.e-gov.go.jp/document")) {
    const lawId = extractEgovLawId(url);
    if (lawId) {
      console.log(`🔄 e-Gov API経由で取得: ${lawId}`);
      const apiUrl = `https://laws.e-gov.go.jp/api/1/lawdata/${lawId}`;

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "application/xml,text/xml,*/*",
          "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
        },
        timeout: 30000,
        maxRedirects: 5,
      });

      return {
        buffer: Buffer.from(response.data),
        headers: response.headers as Record<string, string>,
        contentType: "application/xml",
        fileSize: Buffer.byteLength(response.data),
        etag: response.headers.etag,
        lastModified: response.headers["last-modified"],
      };
    }
  }
  const response = await axios.get(url, {
    responseType: "arraybuffer",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "ja,en-US;q=0.7,en;q=0.3",
      "Accept-Encoding": "gzip, deflate, br",
    },
    timeout: 30000,
    maxRedirects: 5, // リダイレクト対応
  });

  return {
    buffer: Buffer.from(response.data),
    headers: response.headers as Record<string, string>,
    contentType: response.headers["content-type"] || "application/octet-stream",
    fileSize: Buffer.byteLength(response.data),
    etag: response.headers.etag,
    lastModified: response.headers["last-modified"],
  };
}

/**
 * PDFからテキストを抽出
 */
export async function extractFromPdf(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    const data = await pdfParse(buffer);

    const result: ExtractionResult = {
      success: true,
      method: "pdf",
      content: {
        full_text: data.text,
        metadata: {
          info: data.info,
          metadata: data.metadata,
          version: data.version,
        },
      },
      warnings: [],
      total_pages: data.numpages,
      extracted_pages: data.numpages,
    };

    // ページ別テキスト抽出（可能な場合）
    if (data.text) {
      // 簡易的なページ分割（改ページ文字やフォーム区切りで分割）
      const pageTexts = data.text
        .split(/\f|\n\s*\n\s*\n/)
        .filter((t) => t.trim());
      if (pageTexts.length > 1) {
        result.content.pages = pageTexts.map((text, index) => ({
          page_num: index + 1,
          text: text.trim(),
        }));
      }
    }

    return result;
  } catch (error) {
    return {
      success: false,
      method: "pdf",
      content: {},
      warnings: [],
      error_message: error instanceof Error ? error.message : "PDF解析エラー",
    };
  }
}

/**
 * HTMLからテキストを抽出
 */
export async function extractFromHtml(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    // 文字エンコーディングを検出・変換
    let html = buffer.toString("utf-8");

    // Shift_JIS検出（meta charsetまたはxml encoding）
    if (
      html.includes("charset=Shift_JIS") ||
      html.includes('encoding="Shift_JIS"')
    ) {
      // Node.js標準ではShift_JISをサポートしていないため、iconvが必要
      // 暫定的にUTF-8として処理し、警告を追加
      console.log("⚠️  Shift_JISエンコーディング検出 - 文字化けの可能性");
    }

    const $ = cheerio.load(html);

    // 不要な要素を除去
    $("script, style, nav, footer, .navigation, .menu").remove();

    // メタデータ抽出
    const metadata = {
      title: $("title").text().trim(),
      description: $('meta[name="description"]').attr("content") || "",
      keywords: $('meta[name="keywords"]').attr("content") || "",
      author: $('meta[name="author"]').attr("content") || "",
    };

    // 本文抽出（より広範囲のセレクタ）
    const mainContent = $(
      "main, article, .content, .main-content, .article-body, #main, #content, .post-content"
    ).first();
    let text = "";

    if (mainContent.length > 0) {
      text = mainContent.text();
    } else {
      // フォールバック: body全体から不要部分を除外
      $(
        "head, script, style, nav, footer, .navigation, .menu, .sidebar, .header"
      ).remove();
      text = $("body").text();
    }

    const cleanText = text
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    // SPA検出（JavaScript必須サイト）
    const warnings: string[] = [];
    if (cleanText.length < 100) {
      warnings.push("抽出されたテキストが短すぎます");

      // SPA特徴の検出
      if (
        html.includes('id="app"') ||
        html.includes('id="root"') ||
        html.includes('type="module"') ||
        html.includes("React") ||
        html.includes("Vue") ||
        html.includes("Angular")
      ) {
        warnings.push("SPA（JavaScript必須）サイトの可能性があります");
      }
    }

    return {
      success: true,
      method: "html",
      content: {
        html,
        text: cleanText,
        metadata,
      },
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      method: "html",
      content: {},
      warnings: [],
      error_message: error instanceof Error ? error.message : "HTML解析エラー",
    };
  }
}

/**
 * XMLからテキストを抽出（e-Gov API用）
 */
export async function extractFromXml(
  buffer: Buffer
): Promise<ExtractionResult> {
  try {
    const xml = buffer.toString("utf-8");
    const $ = cheerio.load(xml, { xmlMode: true });

    // e-Gov API XMLから法令本文を抽出
    const lawFullText = $("LawFullText").text();
    const lawTitle = $("LawTitle").text();
    const lawNum = $("LawNum").text();

    const cleanText = lawFullText
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();

    const metadata = {
      title: lawTitle,
      lawNumber: lawNum,
      source: "e-Gov API",
    };

    return {
      success: true,
      method: "text",
      content: {
        full_text: cleanText,
        text: cleanText,
        metadata,
      },
      warnings:
        cleanText.length < 100 ? ["抽出されたテキストが短すぎます"] : [],
    };
  } catch (error) {
    return {
      success: false,
      method: "text",
      content: {},
      warnings: [],
      error_message: error instanceof Error ? error.message : "XML解析エラー",
    };
  }
}

/**
 * コンテンツタイプに基づいて適切な抽出方法を選択
 */
export async function extractContent(
  buffer: Buffer,
  contentType: string
): Promise<ExtractionResult> {
  if (contentType.includes("pdf")) {
    return extractFromPdf(buffer);
  } else if (
    contentType.includes("html") ||
    contentType.includes("text/html")
  ) {
    return extractFromHtml(buffer);
  } else if (contentType.includes("xml")) {
    return extractFromXml(buffer);
  } else if (contentType.includes("text/")) {
    // プレーンテキスト
    const text = buffer.toString("utf-8");
    return {
      success: true,
      method: "text",
      content: {
        full_text: text,
        text,
      },
      warnings: [],
    };
  } else {
    return {
      success: false,
      method: "text",
      content: {},
      warnings: [],
      error_message: `未対応のコンテンツタイプ: ${contentType}`,
    };
  }
}
