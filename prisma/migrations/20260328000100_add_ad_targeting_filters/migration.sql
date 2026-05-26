ALTER TABLE "Advertisement"
ADD COLUMN "targetPageTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "targetCategorySlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "targetTagSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "targetPageSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
