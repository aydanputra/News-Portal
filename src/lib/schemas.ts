
import { z } from "zod";

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
  
  // Children
  children: z.array(z.any()).optional(),
}).passthrough(); // Allow unknown keys but ensure known ones are correct types

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
