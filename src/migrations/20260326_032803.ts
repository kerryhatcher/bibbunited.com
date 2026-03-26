import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "news_posts" ADD COLUMN "excerpt" varchar;
  ALTER TABLE "_news_posts_v" ADD COLUMN "version_excerpt" varchar;
  ALTER TABLE "site_theme" ADD COLUMN "og_default_image_id" integer;
  ALTER TABLE "site_theme" ADD CONSTRAINT "site_theme_og_default_image_id_media_id_fk" FOREIGN KEY ("og_default_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "site_theme_og_default_image_idx" ON "site_theme" USING btree ("og_default_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_theme" DROP CONSTRAINT "site_theme_og_default_image_id_media_id_fk";
  
  DROP INDEX "site_theme_og_default_image_idx";
  ALTER TABLE "news_posts" DROP COLUMN "excerpt";
  ALTER TABLE "_news_posts_v" DROP COLUMN "version_excerpt";
  ALTER TABLE "site_theme" DROP COLUMN "og_default_image_id";`)
}
