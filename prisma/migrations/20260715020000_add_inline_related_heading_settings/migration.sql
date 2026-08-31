ALTER TABLE "Setting"
ADD COLUMN IF NOT EXISTS "postInlineRelatedHeadingText" TEXT NOT NULL DEFAULT 'Baca Juga',
ADD COLUMN IF NOT EXISTS "postInlineRelatedHeadingFont" TEXT NOT NULL DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS "postInlineRelatedHeadingFontWeight" TEXT NOT NULL DEFAULT '700',
ADD COLUMN IF NOT EXISTS "postInlineRelatedHeadingLetterSpacing" TEXT NOT NULL DEFAULT '0';
