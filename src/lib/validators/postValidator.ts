
import { z } from "zod";
import { PostType } from "@prisma/client";

// ==========================================
// Base Schemas (Shared Fields)
// ==========================================

const isAbsoluteOrRelativeUrl = (value: string) => {
  const trimmed = value.trim();
  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return true;
  if (trimmed.includes("://")) return false;
  if (/\s/.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  if (/^[A-Za-z0-9][A-Za-z0-9._~/%\-]+$/.test(trimmed) && trimmed.includes("/")) return true;
  return false;
};

const galleryUrlSchema = z.string().min(1, "URL gambar tidak valid").refine(isAbsoluteOrRelativeUrl, "URL gambar tidak valid");

const galleryItemSchema = z.object({
  id: z.string().optional(), // ID optional for new items
  url: galleryUrlSchema,
  caption: z.string().optional(),
});

// ==========================================
// Main Post Validation Schema
// ==========================================

export const postSchema = z.object({
  // --- Core Fields ---
  title: z
    .string({ required_error: "Judul wajib diisi" })
    .min(3, "Judul minimal 3 karakter")
    .trim(),
    
  subtitle: z.string().optional().nullable(),
  
  content: z
    .string({ required_error: "Konten wajib diisi" })
    .min(10, "Konten terlalu pendek (minimal 10 karakter)"),
    
  // --- Categorization ---
  categoryId: z
    .string({ required_error: "Kategori wajib dipilih" })
    .min(1, "Kategori wajib dipilih"),

  categoryIds: z.array(z.string()).optional(),
    
  tags: z.array(z.string()).optional(),

  // --- Content Type ---
  type: z.nativeEnum(PostType, {
    required_error: "Tipe konten wajib dipilih",
    invalid_type_error: "Tipe konten tidak valid",
  }),

  // --- Type Specific Fields (Nullable in DB, but conditionally required here) ---
  videoUrl: z.string().url("URL Video tidak valid").optional().nullable().or(z.literal("")),
  
  gallery: z
    .array(z.union([galleryItemSchema, galleryUrlSchema]))
    .optional()
    .nullable()
    .transform((items) => {
      if (!items) return items;
      return items.map((item) => (typeof item === "string" ? { url: item, caption: "" } : item));
    }),
  
  // --- Media & Images ---
  featuredImageId: z.string().optional().nullable(), // For relation
  image: z.string().optional().nullable(), // For thumbnail (legacy)
  imageCaption: z.string().optional().nullable(),

  // --- SEO Fields ---
  metaTitle: z.string().optional().nullable(),
  metaDesc: z.string().optional().nullable(),

  viewsBase: z.coerce.number().int().min(0).optional(),

  // --- Status & Governance ---
  status: z.enum(["DRAFT", "IN_REVIEW", "REJECTED", "PUBLISHED", "ARCHIVED", "SCHEDULED"]).optional(),
  published: z.boolean().optional(),
  publishedAt: z.string().or(z.date()).optional().nullable().transform((val) => val ? new Date(val) : null),
  
  authorId: z.string().cuid().optional(),
  approvedById: z.string().cuid().optional().nullable(),
  reviewEditorIds: z.array(z.string().cuid()).optional(),

  // --- Future Proofing (Breaking News) ---
  isBreaking: z.boolean().default(false).optional(),
}).superRefine((data, ctx) => {
  
  // ==========================================
  // Conditional Validation per PostType
  // ==========================================

  // 1. VIDEO Validation
  if (data.type === "VIDEO") {
    if (!data.videoUrl || data.videoUrl.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL Video wajib diisi untuk tipe konten VIDEO",
        path: ["videoUrl"],
      });
    }
  }

  // 2. GALLERY Validation
  if (data.type === "GALLERY") {
    if (!data.gallery || !Array.isArray(data.gallery) || data.gallery.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Galeri wajib memiliki minimal 1 gambar",
        path: ["gallery"],
      });
    }
  }

  // 3. INFOGRAPHIC Validation
  if (data.type === "INFOGRAPHIC") {
    // Infographic must have a featured image (the infographic itself)
    if (!data.featuredImageId && (!data.image || data.image.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Infografis wajib memiliki Featured Image",
        path: ["featuredImageId"],
      });
    }
  }

  // 4. ARTICLE Validation
  if (data.type === "ARTICLE") {
    // Article content is already required in base schema, but we can add more specific checks here
    if (data.content.trim().length < 50) {
       ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Artikel harus memiliki konten teks yang memadai (min 50 karakter)",
        path: ["content"],
      });
    }
  }
});

// ==========================================
// Helper Function
// ==========================================

export async function validatePost(data: any) {
  try {
    const validData = await postSchema.parseAsync(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Format Zod error to readable string or object
      const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
      }));
      return { success: false, errors: formattedErrors };
    }
    return { success: false, errors: [{ message: "Unknown validation error" }] };
  }
}
