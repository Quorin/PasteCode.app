CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";

CREATE TABLE IF NOT EXISTS "confirmation_code" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(36) NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp (0) with time zone NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "confirmation_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "paste" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"title" varchar(255) DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"password" varchar(255),
	"style" varchar(16),
	"description" text,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp (0) with time zone,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "reset_password" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"code" varchar(36) NOT NULL,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp (0) with time zone NOT NULL,
	"user_id" uuid NOT NULL,
	CONSTRAINT "reset_password_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag_on_paste" (
	"paste_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT tag_on_paste_paste_id_tag_id_pk PRIMARY KEY("paste_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(32) NOT NULL,
	CONSTRAINT "tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v7() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"accept_terms" boolean DEFAULT true NOT NULL,
	"password" varchar(255) NOT NULL,
	"confirmed" boolean DEFAULT false NOT NULL,
	"credentials_updated_at" timestamp (0) with time zone,
	"created_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (0) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_name_unique" UNIQUE("name"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "confirmation_code_idx" ON "confirmation_code" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "reset_password_idx" ON "reset_password" ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "paste_id_idx" ON "tag_on_paste" ("paste_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tag_name_idx" ON "tag" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_idx" ON "user" ("email");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "confirmation_code" ADD CONSTRAINT "confirmation_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "paste" ADD CONSTRAINT "paste_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "reset_password" ADD CONSTRAINT "reset_password_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_on_paste" ADD CONSTRAINT "tag_on_paste_paste_id_paste_id_fk" FOREIGN KEY ("paste_id") REFERENCES "paste"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tag_on_paste" ADD CONSTRAINT "tag_on_paste_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
