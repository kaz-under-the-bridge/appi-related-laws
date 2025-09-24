import { z } from "zod";

// Frontmatter schema
export const FrontmatterSchema = z.object({
  doc_type: z.enum([
    "summary",
    "points",
    "consulting",
    "changelog",
    "index",
    "notes",
  ]),
  title: z.string(),
  title_en: z.string().optional(),
  source_url: z.union([z.string().url(), z.array(z.string().url())]),
  source_org: z.array(z.string()),
  source_type: z.enum(["law", "guideline", "faq", "ruling", "press", "draft"]),
  source_version: z.string().optional(),
  source_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  retrieved_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  last_reviewed_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  lang: z.enum(["ja", "en", "ja-en"]).default("ja"),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

// URL List entry
export const UrlListEntrySchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  directoryName: z.string().optional(),
  processingMethod: z.enum(["auto", "egov-api", "skip"]).optional(),
});

// Ingested document schema
export const IngestedDocumentSchema = z.object({
  slug: z.string(),
  source_info: z.object({
    url: z.string().url(),
    title: z.string(),
    retrieved_at: z.string(),
    etag: z.string().optional(),
    last_modified: z.string().optional(),
    content_type: z.string().optional(),
    file_size: z.number().optional(),
    checksum: z.string().optional(),
  }),
  extraction_meta: z.object({
    success: z.boolean(),
    method: z.enum(["html", "pdf", "text", "ocr"]),
    total_pages: z.number().optional(),
    extracted_pages: z.number().optional(),
    failed_pages: z.array(z.number()).optional(),
    warnings: z.array(z.string()).optional(),
    error_message: z.string().optional(),
    skipped_reason: z.string().optional(),
  }),
  content: z.object({
    full_text: z.string().optional(),
    html: z.string().optional(),
    text: z.string().optional(),
    pages: z
      .array(
        z.object({
          page_num: z.number(),
          text: z.string(),
        })
      )
      .optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export type Frontmatter = z.infer<typeof FrontmatterSchema>;
export type UrlListEntry = z.infer<typeof UrlListEntrySchema>;
export type IngestedDocument = z.infer<typeof IngestedDocumentSchema>;
