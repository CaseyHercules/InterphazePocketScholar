-- This is an empty migration.

-- This migration removes the CharacterSkills relation table if it exists
-- while preserving the PrimarySkills and SecondarySkills tables

-- In Prisma's client-only relations, we don't need to drop actual database objects
-- since they only exist in the Prisma schema, not in the actual database

-- If there was a CharacterSkills table in the database, we would drop it like this:
-- DROP TABLE IF EXISTS "_CharacterSkills";

-- Since we're using relationMode="prisma", we only need to update the schema
-- which has already been done by removing the related @relation directives