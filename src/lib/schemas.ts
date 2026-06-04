
import { z } from "zod";
import { sanitizeContent, sanitizeCssUrl, sanitizeExternalUrl } from "@/lib/sanitizer";

export const HomepageBlockConfigSchema = z.object({
  // Layout
  layout: z.string().optional(),
  containerWidth: z.enum(['boxed', 'full', 'custom']).optional(),
  customContainerWidth: z.union([z.string(), z.number()]).optional(),
  
  // Spacing (Ensure numbers)
  paddingTop: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  paddingBottom: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  
  // Content Source
  source: z.string().optional(),
  categoryId: z.string().optional(),
  tagId: z.string().optional(),
  limit: z.union([z.string(), z.number()]).transform(val => Number(val)).optional(),
  
  // Typography
  blockTitle: z.string().optional(),
  blockTitleColor: z.string().optional(),
  blockTitleFontSize: z.union([z.string(), z.number()]).optional(),

  backgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),
  tabletBackgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),
  mobileBackgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),
  boxBackgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),
  tabletBoxBackgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),
  mobileBoxBackgroundImage: z.string().transform((v) => sanitizeCssUrl(v)).optional(),

  socialTiktokUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),
  socialInstagramUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),
  socialFacebookUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),
  socialTwitterUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),
  socialYoutubeUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),
  socialWebsiteUrl: z.string().transform((v) => sanitizeExternalUrl(v)).optional(),

  adCode: z.string().transform((v) => sanitizeContent(v)).optional(),
  
  // Children
  children: z.array(z.any()).optional(),
}).passthrough(); // Allow unknown keys but ensure known ones are correct types

export const BuilderLocationSchema = z.enum(["home", "post", "archive", "header", "footer"]);

export const HomepageBlockInputSchema = z
  .object({
    id: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/),
    type: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/),
    title: z.union([z.string(), z.null()]).optional(),
    order: z.number().int().optional(),
    isActive: z.boolean().optional(),
    isVisible: z.boolean().optional(),
    placement: z.string().optional(),
    config: z.unknown().optional(),
  })
  .passthrough();

export const HomepageBlocksInputSchema = z.array(HomepageBlockInputSchema).max(250);

export const ThemeConfigSchema = z.object({
  headingFont: z.string().optional(),
  bodyFont: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  accentColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  headingColor: z.string().optional(),
  // ... allow others
}).passthrough();
