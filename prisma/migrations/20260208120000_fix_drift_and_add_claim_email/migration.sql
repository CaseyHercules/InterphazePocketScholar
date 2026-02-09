-- Fix drift: Adjustment.visibilityRoles (missing from 20260129120000_add_visibility_roles)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Adjustment' AND column_name = 'visibilityRoles'
  ) THEN
    ALTER TABLE "Adjustment" ADD COLUMN "visibilityRoles" "Role"[] NOT NULL DEFAULT ARRAY[]::"Role"[];
  END IF;
END $$;

-- Add Character.claimEmail and index for email-based passport assignment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Character' AND column_name = 'claimEmail'
  ) THEN
    ALTER TABLE "Character" ADD COLUMN "claimEmail" TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Character_claimEmail_idx" ON "Character"("claimEmail");
