import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Create the organizations level enum
  await db.execute(sql`
    CREATE TYPE "public"."enum_organizations_level" AS ENUM('county', 'state', 'national');
  `)

  // Step 2: Create the organizations table
  await db.execute(sql`
    CREATE TABLE "organizations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "level" "enum_organizations_level" NOT NULL,
      "slug" varchar,
      "website" varchar,
      "phone" varchar,
      "email" varchar,
      "address_street" varchar,
      "address_city" varchar,
      "address_state" varchar,
      "address_zip" varchar,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
    CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
    CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  `)

  // Step 3: Seed the 3 existing governing bodies as county-level organizations
  await db.execute(sql`
    INSERT INTO "organizations" ("name", "level", "slug", "sort_order")
    VALUES
      ('Board of Education', 'county', 'board-of-education', 1),
      ('County Commission', 'county', 'county-commission', 2),
      ('Water Board', 'county', 'water-board', 3);
  `)

  // Step 4: Add organization_id column to officials (nullable initially)
  await db.execute(sql`
    ALTER TABLE "officials" ADD COLUMN "organization_id" integer;
  `)

  // Step 5: Map existing body enum values to organization IDs via slug matching
  await db.execute(sql`
    UPDATE "officials" o
    SET "organization_id" = org.id
    FROM "organizations" org
    WHERE (o."body"::text = 'board-of-education' AND org."slug" = 'board-of-education')
       OR (o."body"::text = 'county-commission' AND org."slug" = 'county-commission')
       OR (o."body"::text = 'water-board' AND org."slug" = 'water-board');
  `)

  // Step 6: Make organization_id NOT NULL and add FK constraint + index
  await db.execute(sql`
    ALTER TABLE "officials" ALTER COLUMN "organization_id" SET NOT NULL;
    ALTER TABLE "officials"
      ADD CONSTRAINT "officials_organization_id_organizations_id_fk"
      FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id")
      ON DELETE set null ON UPDATE no action;
    CREATE INDEX "officials_organization_idx" ON "officials" USING btree ("organization_id");
  `)

  // Step 7: Drop the old body column and enum type
  await db.execute(sql`
    ALTER TABLE "officials" DROP COLUMN "body";
    DROP TYPE "public"."enum_officials_body";
  `)

  // Step 8: Add organizations to payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "organizations_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk"
      FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_organizations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("organizations_id");
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Step 1: Drop organizations column/constraint/index from payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      DROP CONSTRAINT "payload_locked_documents_rels_organizations_fk";
    DROP INDEX "payload_locked_documents_rels_organizations_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "organizations_id";
  `)

  // Step 2: Re-create enum_officials_body type with original values
  await db.execute(sql`
    CREATE TYPE "public"."enum_officials_body" AS ENUM('board-of-education', 'county-commission', 'water-board');
  `)

  // Step 3: Add body column back to officials using the enum
  await db.execute(sql`
    ALTER TABLE "officials" ADD COLUMN "body" "enum_officials_body";
  `)

  // Step 4: Map organization_id back to body enum values via JOIN on organizations
  await db.execute(sql`
    UPDATE "officials" o
    SET "body" = CASE
      WHEN org."slug" = 'board-of-education' THEN 'board-of-education'::"enum_officials_body"
      WHEN org."slug" = 'county-commission' THEN 'county-commission'::"enum_officials_body"
      WHEN org."slug" = 'water-board' THEN 'water-board'::"enum_officials_body"
    END
    FROM "organizations" org
    WHERE o."organization_id" = org."id";
  `)

  // Step 5: Make body NOT NULL
  await db.execute(sql`
    ALTER TABLE "officials" ALTER COLUMN "body" SET NOT NULL;
  `)

  // Step 6: Drop organization_id column, its FK constraint, and its index from officials
  await db.execute(sql`
    ALTER TABLE "officials"
      DROP CONSTRAINT "officials_organization_id_organizations_id_fk";
    DROP INDEX "officials_organization_idx";
    ALTER TABLE "officials" DROP COLUMN "organization_id";
  `)

  // Step 7: Drop the organizations table
  await db.execute(sql`
    DROP TABLE "organizations";
  `)

  // Step 8: Drop enum_organizations_level type
  await db.execute(sql`
    DROP TYPE "public"."enum_organizations_level";
  `)
}
