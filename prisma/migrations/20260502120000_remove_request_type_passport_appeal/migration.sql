CREATE TYPE "RequestType_new" AS ENUM ('SKILL', 'SPELL', 'CHARACTER', 'OTHER');

ALTER TABLE "Request"
  ALTER COLUMN "type" TYPE "RequestType_new"
  USING (
    CASE
      WHEN "type" IS NULL THEN NULL::"RequestType_new"
      WHEN "type"::text = 'PASSPORT_APPEAL' THEN NULL::"RequestType_new"
      ELSE ("type"::text)::"RequestType_new"
    END
  );

DROP TYPE "RequestType";

ALTER TYPE "RequestType_new" RENAME TO "RequestType";

ALTER TYPE "RequestType" ADD VALUE 'PASSPORT_APPEAL';
