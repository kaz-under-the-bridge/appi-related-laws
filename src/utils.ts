import { createHash } from "crypto";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * 項目名からslugを生成
 * 例: "個人情報の保護に関する法律" → "appi-law"
 */
export function generateSlug(title: string): string {
  // 文字化けや空文字のチェック
  if (!title || title.trim().length === 0) {
    return "untitled";
  }

  // 文字化け検出（制御文字や不正なUnicode）
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(title)) {
    console.log(`⚠️  文字化けを検出: ${title.substring(0, 50)}...`);
    return `garbled-${calculateHash(title).substring(0, 8)}`;
  }

  const slug = title
    .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)) // 全角数字→半角
    .replace(/[Ａ-Ｚａ-ｚ]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    ) // 全角英字→半角
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // 英数字以外をハイフンに
    .replace(/-+/g, "-") // 連続ハイフンを1個に
    .replace(/^-|-$/g, ""); // 先頭末尾のハイフンを削除

  // 空になった場合のフォールバック
  return slug || `fallback-${calculateHash(title).substring(0, 8)}`;
}

/**
 * URLを正規化（chrome-extension除去など）
 */
export function normalizeUrl(url: string): string | null {
  // chrome-extension://... の場合、https://部分を抽出
  const chromeExtMatch = url.match(
    /chrome-extension:\/\/[^\/]+\/(https?:\/\/.+)/
  );
  if (chromeExtMatch) {
    return chromeExtMatch[1];
  }

  // 通常のHTTP(S)URLかチェック
  if (url.match(/^https?:\/\//)) {
    return url;
  }

  return null;
}

/**
 * ファイルのハッシュを計算
 */
export function calculateHash(content: Buffer | string): string {
  return createHash("sha256").update(content).digest("hex").substring(0, 16);
}

/**
 * ディレクトリが存在しない場合は作成
 */
export async function ensureDir(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * 重複回避のためのslug生成（ハッシュ付与）
 */
export async function generateUniqueSlug(
  baseSlug: string,
  checkDir: string
): Promise<string> {
  const existingFiles = await fs.readdir(checkDir).catch(() => []);
  const existingSlugs = existingFiles.map((f) => path.parse(f).name);

  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // 重複がある場合、短いハッシュを付与
  const hash = calculateHash(baseSlug).substring(0, 6);
  return `${baseSlug}-${hash}`;
}
